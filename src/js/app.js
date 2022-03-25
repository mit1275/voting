App = {
  web3Provider: null,
  contracts: {},
  account:0x0,

  init: async function() {
    // Load pets.
    // $.getJSON('../pets.json', function(data) {
    //   var petsRow = $('#petsRow');
    //   var petTemplate = $('#petTemplate');

    //   for (i = 0; i < data.length; i ++) {
    //     petTemplate.find('.panel-title').text(data[i].name);
    //     petTemplate.find('img').attr('src', data[i].picture);
    //     petTemplate.find('.pet-breed').text(data[i].breed);
    //     petTemplate.find('.pet-age').text(data[i].age);
    //     petTemplate.find('.pet-location').text(data[i].location);
    //     petTemplate.find('.btn-adopt').attr('data-id', data[i].id);

    //     petsRow.append(petTemplate.html());
    //   }
    // });

    return await App.initWeb3();
  },

  initWeb3: async function() {
    
    if(typeof web3!=='undefined')
    {
      App.web3Provider=web3.currentProvider;
      web3=new Web3(web3.currentProvider);
    }
    else
    {
      App.web3Provider=new Web3.providers.HttpProvider('http://localhost:7545');
      web3=new Web3(App.web3Provider);
    }

    return App.initContract();
  },

  initContract: function() {
   $.getJSON("Contest.json",function(contest){
    App.contracts.Contest=TruffleContract(contest);
    App.contracts.Contest.setProvider(App.web3Provider);

    App.listenForEvents();
    return App.render();
    }); 
  },

  listenForEvents:function(){
    App.contracts.Contest.deployed().then(function(instance){
      instance.votedEvent({},{
        fromBlock:0,
        toBlock:'latest'
      }).watch(function(err,event){
        console.log("event triggered",event);

        App.render();
      });
    });
  },

  render:function(){

    var contestantInstance;
    var loader=$("#loader");
    var content=$("#content");

    loader.show();
    content.hide();

    web3.eth.getCoinbase(function(err,account){
      if(err==null)
      {
        App.account=account;
        $("#accountAdress").html("Your account: "+account);
      }
    });
    App.contracts.Contest.deployed().then(function(instance){
      contestInstance=instance;
      return contestInstance.contestantCount();
    }).then(function(contestantCount){
      var contestantResult=$("#contestantResult");
      contestantResult.empty();

      // var contestantdata=$("#contestantResult");
      // contestantResult.empty();

      var contestantselect=$("#contestantselect");
      contestantselect.empty();

      for(var i=1;i<=contestantCount;i++)
      {
        contestInstance.contestants(i).then(function(contestant){
          var id=contestant[0];
          var name=contestant[1];
          var votecount=contestant[2];

          var contestantTemp="<tr><th>"+id+"</th><td>"+name+"</td><td>"+votecount+"</td><tr>"
          contestantResult.append(contestantTemp);

          var contestantOpt="<option value="+id+ ">"+name+"</option>"
          contestantselect.append(contestantOpt);
        });
      }
      loader.hide();
      content.show();
    }).catch(function(err){
      console.warn(err);
    });
  },

  castVote:function(){
    var contestantId=$("#contestantselect").val();
     App.contracts.Contest.deployed().then(function(instance){
      return instance.vote(contestantId,{from:App.account});
     }).then(function(result){
       $("#content").hide();
       $("#loader").show();

     }).catch(function(err){
      console.log(err);
     });
  }

  // bindEvents: function() {
  //   $(document).on('click', '.btn-adopt', App.handleAdopt);
  // },

 

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
