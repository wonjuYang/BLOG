require('dotenv').config();

const mongoose = require('mongoose');
const session = require('koa-session');


const {
    PORT: port = 4000, // 값이 존재하지 않는다면 4000을 기본값으로 사용
    MONGO_URI: mongoURI,
    COOKIE_SIGN_KEY: signKey
  } = process.env;

mongoose.Promise = global.Promise; // Node의 Promise를 사용하도록 설정
mongoose.connect(mongoURI, {useNewUrlParser: true}).then(() => {
    console.log('connected to mongodb');
}).catch((e) =>{
    console.error(E);
});

const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');

const api = require('./api');


const app = new Koa();
const router = new Router();


//라우터 설정
/* 
router.get('/', (ctx) => {
    ctx.body = '홈';
});

router.get('/about/:name?' , (ctx) => {
    const { name } = ctx.params;
    //name의 존재 유무에 따라 다른 결과 출력
    ctx.body= name? `${name}의 소개 ` : '소개';
});

router.get('/posts' , (ctx) => {
    const { id } = ctx.query;
    //id의 존재 유무에 따라 다른 결과 출력
    ctx.body = id? `포스트 #${id}` : '포스트 아이디가 없습니다.';
});



*/

router.use('/api' , api.routes()); //api 라우트 적용

//라우터 적용 전에 bodyParser 적용
app.use(bodyParser());

const sessionConfig = {
    maxAge: 86400000,
    //signed: true(기본적으로 설정되어 있습니다.)
}

app.use(session(sessionConfig, app));
app.keys=[signKey];

//app인스턴스에 라우터 적용
app.use(router.routes()).use(router.allowedMethods());


app.listen(port, () => {
    console.log('listening to port', port);
});
3