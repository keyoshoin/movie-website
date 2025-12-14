(async ()=>{
  try{
    const DM = require('../utils/dataManager');
    const love = await DM.findMoviesByGenre('爱情');
    console.log('爱情 count:', love.length);
    console.log(love.map(m => ({id: m.id, title: m.title, genre: m.genre})));
    const anim = await DM.findMoviesByGenre('动画');
    console.log('动画 count:', anim.length);
    console.log(anim.map(m => ({id: m.id, title: m.title, genre: m.genre})));
  }catch(e){
    console.error(e);
  }finally{
    process.exit();
  }
})();
