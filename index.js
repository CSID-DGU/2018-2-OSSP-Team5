var express=require('express');

let app=express();

var session=require('express-session');



var jq = require("jquery");

var bodyParser=require("body-parser");

let OrientDB=require('orientjs');



app.use(session({

  secret: 'secret key',
  
  resave: false,
  saveUninitialized: true,
  
  cookie: { secure: false, maxAge: 60*20000 }
  
  //using secure flag means that the cookie will be set on Https only
})
       )



app.use(bodyParser.urlencoded({ extended: false }));

app.use('/template',express.static('./template/'));

app.use('/jquery', express.static('./template/js/node_modules/jquery/dist/'));



app.set('views','./template');//여기 디렉토리에 템플릿 파일을 넣겠다는 선언

app.set('view engine','ejs');//어떤 형식의 템플릿을 사용할 것인지 선언

app.locals.pretty=true;





let server=OrientDB({

  host:'localhost',
  
  port:2424,//기본 포트
  
  username:'root',
  
  password:'*******'
})
;

let db=server.use({

  name:'gettingStarted',
  
  username: 'admin',
  
  password: '*******'
  
});

console.log('Using Database:'+ db.name);







app.post('/signup',function(req,res){

  let pname=req.body.personName;
  
  let pdate=req.body.personBirthDate;
  
  let pbloodtype=req.body.personBloodType;
  
  let pemail=req.body.personEmail;
  
  let ppocket=req.body.personPocket;
  
  let pid=req.body.personID;
  
  let ppwd=req.body.personPwd;
  
  let ppwd2=req.body.personPwd2;

  
var sql='insert into personInfo (name,birthDate,bloodType,email,coinPocket,id,pwd)'+

  'values(:name,:birthDate,:bloodType,:email,:coinPocket,:id,:pwd)';
  
  db.query(sql,{
  
    params:{
    
      name:pname,
      
      birthDate:pdate,
      
      bloodType:pbloodtype,
      
      email:pemail,
      
      coinPocket:ppocket,
      
      id:pid,
      
      pwd:ppwd
      
    }

  }).then(function(results){
  
  })
  
  res.redirect('/');

})


app.get('/login',function(req,res){

  res.render('login.ejs');

});


app.post('/loginverify',function(req,res){

  var id=req.body.id;
  
  var password=req.body.password;
  
  var sql="select id,pwd,name, coinPocket,bloodType from personInfo where id='"+id+"'and pwd='"+password+"'";

  
  
  db.query(sql).then(function(results){
  
    //console.log(results[0].name);
    
    if( results[0].id === undefined){
    
      res.redirect('errPage');
    
    }
    else ((id==results[0].id) && (password==results[0].pwd))
    {
    
     
      req.session.user={
      
        id: results[0].id,
        
        name:results[0].name,
        
        pocket:results[0].coinPocket,
        
        bloodType:results[0].bloodType
    };
      
    
      req.session.save(() => {
      
        if("root"==results[0].id){
        
          var sql="select * from donationReserved";
          
          db.query(sql).then(function(results){
          
            res.render('login_admin.ejs',{name:req.session.user.name, result:results});
        
          })
      }
      else{
        
        res.render('index.ejs',{name:req.session.user.name});
      }
    });

    //console.log(req.session.user);
    }
  });
})


app.get('/',function(req,res){

  if(req.session.user){

  
    res.render('index.ejs',{name:req.session.user.name});
    }
    else{
    
      res.render('index.ejs',{name:null});
    }
});

app.get('/logout',function (req,res) {

  req.session.user= null;
    //왜 req.session.destroy() 가 3.0 에서는 안 될까?
  
  res.redirect('/');
})
app.get('/signup',function(req,res){
  //let title='학생 성적표 등록하기';

  res.render('signup.ejs');
});
app.get('/board',function(req,res){
  var sql="select * from noticeBoard";

  if(req.session.user){
    var user=req.session.user;
    //console.log(user);
      db.query(sql).then(function(results){
      res.render('board.ejs',{name:req.session.user.name,data:results});
    })
  }
})
app.get('/mypage',function(req,res){
  if(req.session.user){
    var user=req.session.user;
    //console.log(user);

      res.render('mypage.ejs',{name:user.name,bloodType:user.bloodType});
  }
  else{
      res.render('mypage.ejs',{name:null});
  }
});

app.get('/boardForWrite',function(req,res){
    var user=req.session.user;
  res.render('boardForWrite.ejs',{name:user.name,bloodType:user.bloodType});
});

app.get('/errPage',function(req,res){

  res.render('errPage.ejs');
});


app.post('/donation',function(req,res){

  var bt=req.body.personBloodType;
  
  var nt=req.body.personDonationType;
  
  var name=req.body.personName;
  
  var pocket=req.session.user.pocket;
  
  var sql='insert into donationReserved (bloodType,donationType,name,coinPocket)'
  +'values(:bloodType,:donationType,:name,:coinPocket)';
  
  db.query(sql,{
       
    params:{
    
      bloodType:bt,
      
      donationType:nt,
      
      name:name,
      
      coinPocket:pocket
      
    }
    
  }).then(function(results){
  
  })
  
  res.redirect('/');
});

app.listen(3000,function(req,res){

  console.log('port 3000 connected!');
});
