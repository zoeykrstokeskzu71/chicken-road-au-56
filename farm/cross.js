(function(){"use strict";var STORE_KEY="coopEggs";var START_EGGS=1000;var LANE_TOTAL=10;var EDGE=1.05;var NUDGE=5;var BET_CAP=100000;var HOP_MS=430;var CRASH_MS=1050;var LADDER=[1.19,1.5,1.92,2.5,3.3,4.45,6.2,8.9,13.5,24.5];var TRAFFIC=["🚗","🚕","🚙","🚌","🚛"];var stripEl=document.getElementById("coop-strip");var shoulderEl=document.getElementById("coop-shoulder");var dotsEl=document.getElementById("coop-dots");var purseEl=document.getElementById("coop-purse-sum");var refillEl=document.getElementById("coop-refill");var betEl=document.getElementById("coop-bet");var betLessEl=document.getElementById("coop-bet-less");var betMoreEl=document.getElementById("coop-bet-more");var hopEl=document.getElementById("coop-hop-btn");var takeEl=document.getElementById("coop-take-btn");var calloutEl=document.getElementById("coop-callout");var bannerEl=document.getElementById("coop-banner");var laneNumEl=document.getElementById("coop-lane-num");var multNumEl=document.getElementById("coop-mult-num");var takeNumEl=document.getElementById("coop-take-num");if(!stripEl||!shoulderEl||!dotsEl||!purseEl||!refillEl||!betEl||!betLessEl||!betMoreEl||!hopEl||!takeEl||!calloutEl||!bannerEl||!laneNumEl||!multNumEl||!takeNumEl){return;}
var laneTiles=[];var dotEls=[];var henEl=null;var curbEl=null;var run={eggs:loadEggs(),phase:"idle",lane:0,bet:0,busy:false};function loadEggs(){var raw=null;try{raw=window.localStorage.getItem(STORE_KEY);}catch(err){raw=null;}
if(raw===null||raw===""){return START_EGGS;}
var num=Number(raw);if(!isFinite(num)||num<0){return START_EGGS;}
return round2(num);}
function saveEggs(){try{window.localStorage.setItem(STORE_KEY,String(run.eggs));}catch(err){return;}}
function paintPurse(){purseEl.textContent=fmt(run.eggs);}
function round2(num){return Math.round(num*100)/100;}
function fmt(num){var r=round2(num);return r===Math.floor(r)?String(r):r.toFixed(2);}
function multAt(lane){return lane<1?1:LADDER[lane-1];}
function surviveOdds(laneIndex){var prev=laneIndex===0?1:LADDER[laneIndex-1];return prev/(LADDER[laneIndex]*EDGE);}
function say(text,mood){calloutEl.textContent=text;calloutEl.classList.remove("coop-callout-glad","coop-callout-sad");if(mood==="glad"){calloutEl.classList.add("coop-callout-glad-ad812327");}else if(mood==="sad"){calloutEl.classList.add("coop-callout-sad-ad812327");}}
function showBanner(text,won){bannerEl.textContent=text;bannerEl.className="coop-banner-ad812327"+
(won?"coop-banner-win":"coop-banner-lose");bannerEl.hidden=false;}
function hideBanner(){bannerEl.hidden=true;bannerEl.textContent="";}
function buildRoad(){stripEl.innerHTML="";dotsEl.innerHTML="";laneTiles=[];dotEls=[];curbEl=document.createElement("div");curbEl.className="coop-lane-ad812327 coop-curb-ad812327";var curbTag=document.createElement("span");curbTag.className="coop-lane-mult-ad812327";curbTag.textContent="Start";curbEl.appendChild(curbTag);stripEl.appendChild(curbEl);for(var i=0;i<LANE_TOTAL;i+=1){var tile=document.createElement("div");tile.className="coop-lane-ad812327";var tag=document.createElement("span");tag.className="coop-lane-mult-ad812327";tag.textContent=LADDER[i].toFixed(2)+"×";tile.appendChild(tag);stripEl.appendChild(tile);laneTiles.push(tile);var dot=document.createElement("li");dot.className="coop-dot-ad812327";dotsEl.appendChild(dot);dotEls.push(dot);}
henEl=document.createElement("span");henEl.className="coop-hen-ad812327";henEl.setAttribute("aria-hidden","true");henEl.textContent="🐔";curbEl.appendChild(henEl);}
function clearRoad(){for(var i=0;i<LANE_TOTAL;i+=1){var tile=laneTiles[i];tile.classList.remove("coop-lane-clear","coop-lane-hit");var extras=tile.querySelectorAll(".coop-car-ad812327, .coop-feather-ad812327");for(var k=0;k<extras.length;k+=1){tile.removeChild(extras[k]);}
dotEls[i].classList.remove("coop-dot-done-ad812327");}
henEl.classList.remove("coop-hen-hop","coop-hen-bonk");curbEl.appendChild(henEl);shoulderEl.scrollTo({left:0,behavior:"smooth"});}
function paintDots(){for(var i=0;i<LANE_TOTAL;i+=1){dotEls[i].classList.toggle("coop-dot-done",i<run.lane);}}
function paintGauges(){laneNumEl.textContent=run.lane+" / "+LANE_TOTAL;multNumEl.textContent=multAt(run.lane).toFixed(2)+"×";if(run.phase==="run"&&run.lane>=1){takeNumEl.textContent=fmt(run.bet*multAt(run.lane));}else if(run.phase==="run"){takeNumEl.textContent=fmt(run.bet);}else{takeNumEl.textContent="—";}}
function centerTile(tile){var left=tile.offsetLeft-
(shoulderEl.clientWidth-tile.offsetWidth)/2;shoulderEl.scrollTo({left:Math.max(0,left),behavior:"smooth"});}
function lockSetup(locked){betEl.disabled=locked;betLessEl.disabled=locked;betMoreEl.disabled=locked;refillEl.disabled=locked;}
function setMoves(){hopEl.disabled=run.busy;takeEl.disabled=run.busy||run.phase!=="run"||run.lane<1;}
function readBet(){var num=Math.floor(Number(betEl.value));return isFinite(num)?num:0;}
function clampBet(){var num=readBet();if(num<1){num=1;}
if(num>BET_CAP){num=BET_CAP;}
betEl.value=String(num);}
function nudgeBet(delta){if(run.phase==="run"){return;}
var num=readBet()+delta;if(num<1){num=1;}
if(num>BET_CAP){num=BET_CAP;}
betEl.value=String(num);}
function onHop(){if(run.busy){return;}
if(run.phase==="idle"){clampBet();var bet=readBet();if(run.eggs<1){say("The purse is empty — press Refill to restock.","sad");return;}
if(bet>run.eggs){say("Not enough eggs in the purse for that bet.","sad");return;}
run.bet=bet;run.lane=0;run.eggs=round2(run.eggs-bet);saveEggs();paintPurse();hideBanner();clearRoad();paintDots();run.phase="run";lockSetup(true);paintGauges();}
attemptHop();}
function attemptHop(){run.busy=true;setMoves();var target=run.lane;var tile=laneTiles[target];tile.appendChild(henEl);henEl.classList.remove("coop-hen-hop-ad812327");void henEl.offsetWidth;henEl.classList.add("coop-hen-hop-ad812327");centerTile(tile);var lucky=Math.random()<surviveOdds(target);window.setTimeout(function(){resolveHop(target,lucky);},HOP_MS);}
function resolveHop(target,lucky){if(!lucky){crash(target);return;}
run.lane=target+1;laneTiles[target].classList.add("coop-lane-clear-ad812327");paintDots();paintGauges();if(run.lane===LANE_TOTAL){settle(true,true);return;}
run.busy=false;setMoves();say("Lane "+run.lane+" cleared — "+
multAt(run.lane).toFixed(2)+"× is yours if you stop now.","glad");}
function crash(target){var tile=laneTiles[target];tile.classList.add("coop-lane-hit-ad812327");var car=document.createElement("span");car.className="coop-car-ad812327";car.setAttribute("aria-hidden","true");car.textContent=TRAFFIC[Math.floor(Math.random()*TRAFFIC.length)];tile.appendChild(car);henEl.classList.add("coop-hen-bonk-ad812327");for(var i=0;i<3;i+=1){var feather=document.createElement("span");feather.className="coop-feather-ad812327";feather.setAttribute("aria-hidden","true");feather.style.left=(18+i*18)+"px";feather.style.animationDelay=(i*0.12)+"s";tile.appendChild(feather);}
say("Bumper! The run ends on lane "+(target+1)+".","sad");window.setTimeout(function(){if(car.parentNode){car.parentNode.removeChild(car);}
settle(false,false);},CRASH_MS);}
function settle(won,fullCross){var lanesDone=run.lane;if(won){var prize=round2(run.bet*multAt(lanesDone));run.eggs=round2(run.eggs+prize);saveEggs();paintPurse();if(fullCross){showBanner("Full crossing! All "+LANE_TOTAL+" lanes for "+fmt(prize)+" eggs at "+
multAt(lanesDone).toFixed(2)+"×.",true);say("The henhouse is cheering. Take another run?","glad");}else{showBanner("Cashed out on lane "+lanesDone+" — "+fmt(prize)+" eggs at "+
multAt(lanesDone).toFixed(2)+"×.",true);say("Banked before the traffic caught up. Nice.","glad");}}else{showBanner("Flattened after "+lanesDone+
(lanesDone===1?" lane":" lanes")+" — "+
fmt(run.bet)+" grain gone.",false);say("Dust off the feathers and try again.","sad");}
run.phase="idle";run.busy=false;lockSetup(false);setMoves();paintGauges();if(run.eggs<1){say("The purse is empty — press Refill to restock.","sad");}}
function onCashOut(){if(run.busy||run.phase!=="run"||run.lane<1){return;}
settle(true,false);}
function onRefill(){if(run.phase==="run"){return;}
run.eggs=START_EGGS;saveEggs();paintPurse();hideBanner();say("Purse restocked to "+START_EGGS+" eggs.","glad");}
hopEl.addEventListener("click",onHop);takeEl.addEventListener("click",onCashOut);refillEl.addEventListener("click",onRefill);betLessEl.addEventListener("click",function(){nudgeBet(-NUDGE);});betMoreEl.addEventListener("click",function(){nudgeBet(NUDGE);});betEl.addEventListener("change",clampBet);buildRoad();paintPurse();paintGauges();setMoves();if(run.eggs<1){say("The purse is empty — press Refill to restock.","sad");}})();