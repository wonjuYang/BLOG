/*
let postId = 1;

const posts = [
    {
        id: 1,
        title: '제목',
        body: '내용'
    }
];

/*
포스트 작성
Post /api/posts
{title, body}
*/
/*
exports.write = (ctx) => {
    //REST API의 request body 는 ctx.request.body에서 조회할 수 있습니다.
    const {
        title,
        body
    } = ctx.request.body;

    postId += 1;

    const post = { id: postId, title, body };
    posts.push(post);
    ctx.body = post;
};

//GET /apo/posts 목록 조회
exports.list = (ctx) => {
    ctx.body = posts;
};

//특정 포스트 조회 GET /api/posts/:id
exports.read = (ctx) => {
    const { id } = ctx.params;

    //주어진 값으로 포스트를 찾습니다. 파라미터로 받아 온 값은 문자열 형식이니 숫자로 변환하거나 비교할 p.id를 문자열로 변경해야합
    const post = posts.find(p => p.id.toString() === id);

    //포스트가 없으면 오류를 반환합니다.
    if(!post){
        ctx.status = 404;
        ctx.body = {
            message: '포스트가 존재하지 않습니다'
        };
        return;
    }

    ctx.body = post;
}


//특정 포스트 제거 DELETE /api/posts/:id

exports.remove = (ctx) => {
    const { id } = ctx.params;

    //해당 id를 가진 post가 몇 번쨰인지 확인합니다.
    const index = posts.findIndex(p=> p.id.toString() === id);

    //포스트가 없으면 오류를 반환합니다.
    if(index === -1){
        ctx.status = 404;
        ctx.body = {
            message: '포스트가 존재하지 않습니다'
        };
        return;
    }

    //index 번째 아이템을 제거합니다.
    posts.splice(index, 1);
    ctx.status = 204; //nocontnet
}

//포스트 수장 (교체) PUT /api/posts/:id {title, body}

exports.replace = (ctx) => {
    //PUT 메소드는 전체포스트 정보를 입력하여 데이터를 통쨰로 교체할 때 사용합니다.
    const { id } = ctx.params;

    //해당 id를 가진 post가 몇 번쨰인지 확인합니다.
    const index = posts.findIndex(p=> p.id.toString() === id);

    //포스트가 없으면 오류를 반환합니다
    if(index === -1 ){
        ctx.status = 404;
        ctx.body = {
            message: '포스트가 존재하지 않습니다'
        };
        return;
    }

    //전체 객체를 덮어씌웁니다.
    //따라서 id를 제외한 기존 정보를 날리고 객체를 새로 만듭니다.
    posts[index] = {
        id,
        ...ctx.request.body
    };
    ctx.body = posts[index];
};

// 포스트 수정( 특정 필드 변경 ) PATCH /api/posts/:id {title, body}

exports.update = (ctx) => {
    //PATCH 메서드는 주어진 필드만 교체합니다.
    const { id } = ctx.params;

    //해당 id를 가진 post가 몇 번쨰인지 확인합니다.
    const index = posts.findIndex(p=> p.id.toString() === id);
    //포스트가 없으면 오류를 반환합니다
    if(index === -1 ){
        ctx.status = 404;
        ctx.body = {
            message: '포스트가 존재하지 않습니다'
        };
        return;
    }
    //기존 값에 정보를 덮어씌웁니다.
    posts[index] = {
        ...posts[index],
        ...ctx.request.body
    };
    ctx.body = posts[index];
}
 */
const Post = require('models/post');


/*
    Post / api/posts
    { title, body, tag }
*/
exports.write = async (ctx) => {
    const {title, body, tags } = ctx.request.body;

    //새 post 인스턴스를 만듭니다.
    const post = new Post({
        title, body, tags
    });

    try{
        await post.save(); //데이터 베이스에 등록합니다.
        ctx.body = post; //저장된 결과를 반환합니다.
    } catch(e){
        //데이터 베이스의 오류가 발생합니다.
        ctx.throw(e, 500);
    }
};


exports.list = async (ctx) => {



    //page가 주어지지 않았다면 1로 간주
    //query는 문자열 형태로 받아 오므로 숫자로 변환
    const page = parseInt(ctx.query.page || 1, 10);

    //잘못된 페이지가 주어졌다면 오류
    if(page < 1){
        ctx.status = 400;
        return;
    }
    try{
        const posts = await Post.find()
            .sort({_id:-1})
            .limit(10)
            .skip((page-1) * 10)
            .exec();
        const postCount = await Post.count().exec();
        //마지막 페이지알려주기
        //ctx.set은 response header를 설정
        ctx.set('Last-Page' , Math.ceil(postCount/10)); 

        const limitBodyLength = post => ({
            ...post.toJSON(),
            body: post.body.length < 200 ? post.body : `${post.body.slice(0, 200)}...`
        });
        ctx.body = posts.map(limitBodyLength);
    }catch(e){
        ctx.throw(e, 500);
    }
};

exports.read = async (ctx) => {
    const { id } = ctx.params;
    try{
        const post = await Post.findById(id).exec();
        //포스트가 존재하지 않습니다.
        if(!post){
            ctx.status = 404;
            return;
        }
        ctx.body = post;
    } catch(e){
        ctx.throw(e, 500);
    }

};

exports.remove = async (ctx) => {
    const { id } = ctx.params;
    try{
        await (await Post.findByIdAndRemove(id)).execPopulate();
        ctx.status = 204;
    } catch(e){
        ctx.throw(e, 500);
    }
};
exports.update = async (ctx) => {
    const { id } = ctx.params;
    try{
        const post = await Post.findByIdAndUpdate(id, ctx.request.body, {
            new: true
            //이 값을 설정해야 업데이트 된 객체를 반환합니다. 설정하지 않으면 업데이트 되기 전의 객체를 반환합니다.
        }).exec();
        //포스트가 존재하지않을 때
        if(!post){
            ctx.status = 404;
            return;
        }
        ctx.body = post;
    }catch(e){
        ctx.throw(e, 500);
    }
};
