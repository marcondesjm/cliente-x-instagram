import {createCipheriv,createDecipheriv,createHash,randomBytes,timingSafeEqual} from 'node:crypto';
import {getSession,isOwner} from './auth.js';
export const PINTEREST_REDIRECT='https://cliente-x-instagram.vercel.app/api/state?pinterest=1&callback=1';
export const PINTEREST_SCOPES=['boards:read','pins:read','user_accounts:read'];
const STATE_COOKIE='__Host-cliente_x_pinterest_state';
const TOKEN_COOKIE='__Host-cliente_x_pinterest';
const API='https://api.pinterest.com/v5/';
const PAGE='/docs/licensed-media.html';
const hash=x=>createHash('sha256').update(x).digest('hex');
const equal=(a,b)=>{const x=Buffer.from(String(a||'')),y=Buffer.from(String(b||''));return x.length===y.length&&timingSafeEqual(x,y);};
export function pinterestConfig(env=process.env){
 const clientId=env.PINTEREST_CLIENT_ID||'',clientSecret=env.PINTEREST_CLIENT_SECRET||'',cookieSecret=env.PINTEREST_COOKIE_SECRET||env.ADMIN_SESSION_SECRET||'';
 const redirectUri=env.PINTEREST_REDIRECT_URI||PINTEREST_REDIRECT;
 const missing=[];if(!clientId)missing.push('PINTEREST_CLIENT_ID');if(!clientSecret)missing.push('PINTEREST_CLIENT_SECRET');if(cookieSecret.length<32)missing.push('PINTEREST_COOKIE_SECRET (32 caracteres ou mais)');
 let valid=false;try{const u=new URL(redirectUri);valid=u.protocol==='https:'&&!u.username&&!u.password&&u.pathname==='/api/state'&&u.searchParams.get('pinterest')==='1'&&u.searchParams.get('callback')==='1';}catch{}
 if(!valid)missing.push('PINTEREST_REDIRECT_URI válida');
 return {clientId,clientSecret,cookieSecret,redirectUri,missing,configured:missing.length===0};
}
export function sealPinterest(value,secret){const iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',createHash('sha256').update(secret).digest(),iv);const data=Buffer.concat([cipher.update(JSON.stringify(value),'utf8'),cipher.final()]);return Buffer.concat([iv,cipher.getAuthTag(),data]).toString('base64url');}
export function openPinterest(value,secret){try{const b=Buffer.from(value,'base64url');if(b.length<29||b.length>3000)return null;const d=createDecipheriv('aes-256-gcm',createHash('sha256').update(secret).digest(),b.subarray(0,12));d.setAuthTag(b.subarray(12,28));return JSON.parse(Buffer.concat([d.update(b.subarray(28)),d.final()]).toString('utf8'));}catch{return null;}}
function cookies(header=''){const out={};for(const part of String(header).split(';')){const i=part.indexOf('=');if(i<0)continue;try{out[part.slice(0,i).trim()]=decodeURIComponent(part.slice(i+1).trim());}catch{}}return out;}
const cookie=(name,value,seconds)=>`${name}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${Math.max(0,Math.floor(seconds))}`;
function httpsUrl(s,host=null){try{const u=new URL(s);if(u.protocol!=='https:'||u.username||u.password||(host&&!host(u.hostname)))return '';return u.href;}catch{return '';}}
export function pinterestPin(pin){
 const id=String(pin.id||'');if(!/^\d{1,30}$/.test(id))return null;
 const images=Object.values(pin.media?.images||{}).sort((a,b)=>(Number(b.width)||0)-(Number(a.width)||0));
 const imageUrl=images.map(i=>httpsUrl(i.url,h=>h==='pinimg.com'||h.endsWith('.pinimg.com'))).find(Boolean)||'';
 return {id,title:String(pin.title||'Pin sem título').slice(0,500),url:'https://www.pinterest.com/pin/'+id+'/',imageUrl,sourceUrl:httpsUrl(pin.link)};
}
export function createPinterestHandler({fetchImpl=fetch,sessionFor=getSession,configFor=()=>pinterestConfig(),now=()=>Date.now()}={}){
 return async(req,res)=>{
 res.setHeader('Cache-Control','private, no-store, max-age=0');res.setHeader('Pragma','no-cache');res.setHeader('Referrer-Policy','no-referrer');res.setHeader('Vary','Cookie');
 const session=sessionFor(req);if(!isOwner(session))return res.status(session?403:401).json({error:'Conexão Pinterest disponível para o administrador principal.'});
 if(!['GET','POST'].includes(req.method))return res.status(405).json({error:'Método não permitido.'});
 const config=configFor(),owner=hash(session.email||''),jar=cookies(req.headers?.cookie||'');
 const publicConfig={configured:config.configured,connected:false,missing:config.missing,redirectUri:config.redirectUri};
 if(req.method==='POST'&&req.headers?.origin){try{if(new URL(req.headers.origin).host!==req.headers.host)throw Error();}catch{return res.status(403).json({error:'Origem inválida.'});}}
 const setCookies=list=>res.setHeader('Set-Cookie',list);
 const redirect=result=>{res.statusCode=303;res.setHeader('Location',PAGE+'?pinterest='+result);return res.end();};
 const request=async(path,token)=>{
 const r=await fetchImpl(API+path,{redirect:'error',signal:AbortSignal.timeout(15000),headers:{Authorization:'Bearer '+token,Accept:'application/json'}});
 if(!r.ok)throw Object.assign(Error(r.status===401?'A autorização do Pinterest expirou. Reconecte a conta.':r.status===403?'O aplicativo ainda não tem acesso a este recurso no Pinterest.':r.status===429?'O Pinterest pediu uma pausa. Tente novamente mais tarde.':'Não foi possível consultar o Pinterest.'),{providerStatus:r.status});
 return r.json();
 };
 try{
 if(req.method==='GET'&&req.query?.callback==='1'){
 setCookies([cookie(STATE_COOKIE,'',0)]);
 if(!config.configured)return redirect('configuration_required');
 const state=openPinterest(jar[STATE_COOKIE]||'',config.cookieSecret);
 if(!state||state.kind!=='state'||state.owner!==owner||state.expiresAt<=now()||!equal(state.nonce,req.query.state)||state.redirectUri!==config.redirectUri)return redirect('invalid_state');
 if(req.query.error)return redirect('denied');
 if(typeof req.query.code!=='string'||req.query.code.length<1||req.query.code.length>2000)return redirect('invalid_code');
 const r=await fetchImpl(API+'oauth/token',{method:'POST',redirect:'error',signal:AbortSignal.timeout(15000),headers:{Authorization:'Basic '+Buffer.from(config.clientId+':'+config.clientSecret).toString('base64'),'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'authorization_code',code:req.query.code,redirect_uri:config.redirectUri}).toString()});
 if(!r.ok)return redirect('exchange_failed');
 const value=await r.json(),seconds=Math.min(30*86400,Number(value.expires_in));
 if(typeof value.access_token!=='string'||value.access_token.length<10||value.access_token.length>2000||!Number.isFinite(seconds)||seconds<60)return redirect('exchange_failed');
 const sealed=sealPinterest({kind:'token',owner,accessToken:value.access_token,expiresAt:now()+seconds*1000},config.cookieSecret);
 if(sealed.length>3800)return redirect('exchange_failed');
 setCookies([cookie(STATE_COOKIE,'',0),cookie(TOKEN_COOKIE,sealed,seconds)]);return redirect('connected');
 }
 if(req.method==='POST'){
 let body=req.body;if(!body){let raw='';for await(const part of req){raw+=part;if(Buffer.byteLength(raw)>4096)throw Error('Solicitação inválida.');}body=JSON.parse(raw||'{}');}else if(typeof body==='string')body=JSON.parse(body);
 if(!body||typeof body!=='object'||Object.keys(body).some(k=>!['action'].includes(k)))return res.status(400).json({error:'Use a autorização do Pinterest. Este endpoint não recebe e-mail, senha ou credenciais de login.'});
 if(body.action==='disconnect'){setCookies([cookie(TOKEN_COOKIE,'',0),cookie(STATE_COOKIE,'',0)]);return res.status(200).json({...publicConfig,disconnected:true});}
 if(body.action!=='connect')return res.status(400).json({error:'Ação desconhecida.'});
 if(!config.configured)return res.status(503).json({...publicConfig,error:'Cadastre o aplicativo no Pinterest Developers e configure as credenciais no servidor.'});
 if(String(req.headers?.host||'').toLowerCase()!==new URL(config.redirectUri).host)return res.status(409).json({error:'Abra a biblioteca no domínio de produção configurado para conectar o Pinterest.'});
 const nonce=randomBytes(32).toString('base64url'),state=sealPinterest({kind:'state',owner,nonce,expiresAt:now()+600000,redirectUri:config.redirectUri},config.cookieSecret);
 setCookies([cookie(STATE_COOKIE,state,600)]);
 const u=new URL('https://www.pinterest.com/oauth/');u.search=new URLSearchParams({client_id:config.clientId,redirect_uri:config.redirectUri,response_type:'code',scope:PINTEREST_SCOPES.join(','),state:nonce}).toString();
 return res.status(200).json({authorizationUrl:u.href});
 }
 if(!config.configured)return res.status(200).json(publicConfig);
 const token=openPinterest(jar[TOKEN_COOKIE]||'',config.cookieSecret);
 if(!token||token.kind!=='token'||token.owner!==owner||token.expiresAt<=now()){if(jar[TOKEN_COOKIE])setCookies([cookie(TOKEN_COOKIE,'',0)]);return res.status(200).json(publicConfig);}
 const base={...publicConfig,connected:true,expiresAt:new Date(token.expiresAt).toISOString()};
 if(req.query?.view==='boards'){
 const u=new URLSearchParams({page_size:'25'});if(req.query.bookmark){if(typeof req.query.bookmark!=='string'||req.query.bookmark.length>2000)throw Error('Página inválida.');u.set('bookmark',req.query.bookmark);}
 const data=await request('boards?'+u,token.accessToken);
 return res.status(200).json({...base,boards:(data.items||[]).filter(b=>/^\d{1,30}$/.test(String(b.id))).map(b=>({id:String(b.id),name:String(b.name||'Pasta').slice(0,200)})),bookmark:data.bookmark||null});
 }
 if(req.query?.view==='pins'){
 const id=String(req.query.boardId||'');if(!/^\d{1,30}$/.test(id))throw Error('Pasta inválida.');
 const u=new URLSearchParams({page_size:'25'});if(req.query.bookmark){if(typeof req.query.bookmark!=='string'||req.query.bookmark.length>2000)throw Error('Página inválida.');u.set('bookmark',req.query.bookmark);}
 const data=await request('boards/'+id+'/pins?'+u,token.accessToken);
 return res.status(200).json({...base,pins:(data.items||[]).map(pinterestPin).filter(Boolean),bookmark:data.bookmark||null});
 }
 const profile=await request('user_account',token.accessToken);return res.status(200).json({...base,profile:{username:String(profile.username||'Conta autorizada').slice(0,150)}});
 }catch(e){
 if(e.providerStatus===401){setCookies([cookie(TOKEN_COOKIE,'',0)]);return res.status(200).json({...publicConfig,error:e.message});}
 if(req.query?.callback==='1')return redirect('exchange_failed');
 return res.status(e.providerStatus===403?403:e.providerStatus===429?429:e.providerStatus?502:400).json({error:e.providerStatus?e.message:'Não foi possível concluir a conexão. Verifique a configuração e tente novamente.'});
 }
 };
}
export default createPinterestHandler();
