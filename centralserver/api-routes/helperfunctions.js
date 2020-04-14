function LoadBalancing(listOfAgents){
  let servicedTodayArr = [];
  for (var i = 0; i< listOfAgents.length; i++) {
      servicedTodayArr.push(listOfAgents[i].servicedToday)
  }
  return servicedTodayArr;
}




module.exports = {
  LoadBalancing : LoadBalancing
}
