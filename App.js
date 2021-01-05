import { StatusBar } from 'expo-status-bar';
import React, {useState, useEffect, useRef} from 'react';
import { If, Then, Else, When, Unless, Switch, Case, Default } from 'react-if';
import { StyleSheet, Text, View, Button, Vibration, Image} from 'react-native';
import * as Location from 'expo-location';
import { Audio } from 'expo-av';
import { DeviceMotion } from 'expo-sensors';
import useInterval from './hooks/useInterval.js';
import * as Permissions from 'expo-permissions';

const sound = new Audio.Sound();
const negSound = new Audio.Sound();


export default function App() {
  const abLat =47.61772680052096;
  const abLon =-122.38379123917166;
  // const abLat =47.47094317456425;
  // const abLon =-122.21327525288945;
  const [location, setLocation] = useState(null);
  const [speed, setSpeed] = useState(null);
  const [distance, setDistance] = useState(null);
  const [distArr, setDistArr] = useState([]);
  const [avgDistance, setAvgDistance] = useState(distance);
  const [errorMsg, setErrorMsg] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [negPlaying, setNegPlaying] = useState(false);
  const [volume, setVolume] = useState(.5);
  const [vol, setVol] = useState(1);
  const [delta, setDelta] = useState(null);
  const [caseNo, setCaseNo] = useState(null);
  const [debug, setDebug] = useState(false);

  const toggleDebug = () => {
    setDebug( debug === false ? true : false);
  }

  function deltaCalc(lat1, lat2, lon1, lon2){	
      // oh my god I just wanted to go to applebees not back to high school trig
      const R = 6371e3; // metres
      const φ1 = lat1 * Math.PI/180; // φ, λ in radians
      const φ2 = lat2 * Math.PI/180;
      const Δφ = (lat2-lat1) * Math.PI/180;
      const Δλ = (lon2-lon1) * Math.PI/180;

      const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ/2) * Math.sin(Δλ/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

      const d = R * c;
      setDistance(d);
  }

  async function currentLocation(){
    //this will melt your call stack unless you manage the promises
    try{
      let location = await Location.getCurrentPositionAsync({accuracy:6});
      setLocation(location);
      setSpeed(location.coords.speed);
      deltaCalc(location.coords.latitude, abLat, location.coords.longitude, abLon)
      Vibration.vibrate([500,200,500]);
    }catch(error){
      let location = await Location.getLastKnownPositionAsync();
      setLocation(location);
      setSpeed(location.coords.speed);
      deltaCalc(location.coords.latitude, abLat, location.coords.longitude, abLon)
      Vibration.vibrate([500,200,500]);
    }

 }

  function avgCalc(distance){
    let array = [...distArr];
    while(array.length > 20){
      array.shift();
    }
    if (array.length === 20){
      array.shift();
    }
    array.push(distance);
    var total = 0;
    for(var i = 0; i < array.length - 1; i++) {
        total += array[i];
    }
    let avg = (total / (array.length - 1) );
    setAvgDistance(avg);
    setDelta(distance - avg);
    console.log('array', array);
    console.log('i 0, prev dist', array[0]);
    console.log('i 1', array[1]);
    console.log('dist', distance);
    console.log('avg', avg);
    //dynamically set volume acceleration based on approx speed:
    // if(volume < .05){
    //   setVol(1)
    // }else{
    //   setVol(distance - prevDist)
    // }
    // console.log('total', total);
    // console.log('average', avg);
    // console.log('array length',array.length)
    // console.log('avgDist', avgDistance)
    setDistArr([...array]);
  }

  // useEffect(() => {
  //   avgCalc(distance)
  // }, [distance]);


  function locSetter(loc){
    setLocation(loc)
    setSpeed(loc.coords.speed);
    deltaCalc(loc.coords.latitude, abLat, loc.coords.longitude, abLon)
  }


  useInterval(() => {
    avgCalc(distance)
    changeVol(speed, distance, playing, negPlaying, volume)
    console.log('boom');
  }, 80);


  useEffect(() => {
    if(playing){
      sound.setVolumeAsync(volume);
    }
    if(negPlaying){
      negSound.setVolumeAsync(volume);
    }
  }, [volume]);

  function changeVol(speed, dist, playing, negPlaying, volume){
    let newVolume;
    if(playing && negPlaying){
      stopNegSound();
    }
    if (negPlaying && volume <=0){
      stopNegSound();
      setCaseNo('CASE 9')
    }
    if (playing && volume <=0){
      stopSound();
      setCaseNo('CASE 10')
    }

      if(playing && speed >.35 && (delta < 0)){
        //walking towards pos song playing:
        newVolume = Math.min(Math.max(parseInt((volume*100) + vol), 0), 100)
        setVolume(newVolume/100);
        setCaseNo('CASE 1')
      }
      else if(playing && speed >.35 && (delta > 0)){
        //walking away pos song playing:
        newVolume = Math.min(Math.max(parseInt((volume*100) - vol), 0), 100)
        setVolume(newVolume/100);
        // console.log('new volume case 2', newVolume/100);
        setCaseNo('CASE 2')
      }
      else if (negPlaying && speed >.35 && (delta < 0)){
        //walking towards neg song playing:
        newVolume = Math.min(Math.max(parseInt((volume*100) - vol), 0), 100)
        setVolume(newVolume/100);
        // console.log(newVolume/100);
        setCaseNo('CASE 3')
      }
      else if (negPlaying && speed >.35 && (delta > 0)){
        //walking away neg song playing:
        newVolume = Math.min(Math.max(parseInt((volume*100) + vol), 0), 100)
        setVolume(newVolume/100);
        // console.log(newVolume/100);
        setCaseNo('CASE 4')
      }
      else if (playing && speed <.35){
        //pos song playing, standing still
        console.log('volCASE5', vol)
        newVolume = Math.min(Math.max(parseInt((volume*100) - vol), 0), 100)
        setVolume(newVolume/100);
        // console.log(newVolume/100);
        setCaseNo('CASE 5')
      }
      else if (negPlaying && speed <.35){
        //neg song playing, standing still
        newVolume = Math.min(Math.max(parseInt((volume*100)- vol), 0), 100)
        setVolume(newVolume/100);
        // console.log(newVolume/100);
        setCaseNo('CASE 6')
      }
      else if (!playing && !negPlaying && speed >.35 && (delta < 0)){
        //if song has stopped due to standing still and user starts moving towards applebees
        setVolume(.01);
        playSound();
        setCaseNo('CASE 7')
      }
      else if (!playing && !negPlaying && speed >.35 && (delta > 0)){
        //if song has stopped due to standing still and user starts moving away from applebees
        setVolume(.01);
        playNegSound();
        setCaseNo('CASE 8')
      }

  }



  async function loadSound(sound, negSound){
    try{
      await sound.loadAsync(require('./assets/sounds/crabrave.mp3'), initialStatus = {}, downloadFirst = true)
      await negSound.loadAsync(require('./assets/sounds/werner.mp3'), initialStatus = {}, downloadFirst = true)
    }catch(error){

    }
  }

  async function playSound(){
    try {

      setPlaying(true);
      await sound.playAsync();
      await sound.setIsLoopingAsync(true)

    } catch (error) {
      // An error occurred!
    }
  }

  async function playNegSound(){
    try {
      setNegPlaying(true);
      await negSound.playAsync();
      await negSound.setIsLoopingAsync(true)
    } catch (error) {
      // An error occurred!
    }
  }

  async function stopSound(){
    try {
      if(playing){
      await sound.setIsLoopingAsync(false)
      await sound.pauseAsync()
      setPlaying(false);
      }
    } catch (error) {
      // An error occurred!
    }
  }

  async function stopNegSound(){
    try {
      if(negPlaying){
        await negSound.setIsLoopingAsync(false)
        await negSound.pauseAsync()
        setNegPlaying(false);
        }
    } catch (error) {
      // An error occurred!
    }
  }

  async function debugSound(){
    try {
      setVolume(.7);
      await sound.playAsync();
      await sound.setIsLoopingAsync(true)
      setPlaying(true);

    } catch (error) {
      // An error occurred!
    }
  }


  useEffect(() => {
    //get permissions for location and initialize location upon loading
    (async () => {
      loadSound(sound, negSound);
      let { status } = await Location.requestPermissionsAsync({accuracy:6});
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }
      let location = await Location.getCurrentPositionAsync({accuracy:6});
      setLocation(location);
      console.log(location);
      deltaCalc(location.coords.latitude, abLat, location.coords.longitude, abLon)
      let options = {
        accuracy: 6, 
        timeInterval:90,
        distanceInterval: .2,
      }
      await Location.watchPositionAsync(options, loc => locSetter(loc)) 

      setVolume(.5);
      sound.setVolumeAsync(volume);
      await sound.playAsync();
      await sound.setIsLoopingAsync(true)
      setPlaying(true);
    })();


  }, []);

  let text = 'Waiting..';
  let distanceText = 'Waiting..';
  let speedText = 'Waiting..';
  let playbackText = 'Waiting..';
  let negPlaybackText = 'Waiting..';
  let volumeText = 'Waiting..';
  let avgDistText = 'Waiting..';
  let caseText = 'Waiting..';
  let volText = 'Waiting..';
  let deltaText = 'Waiting..';
  

  if (errorMsg) {
    text = errorMsg;
  }else if (location) {
    let lat = location.coords.latitude;
    let lon = location.coords.longitude;
    let speed = location.coords.speed;
    text = JSON.stringify(`${lat}, ${lon}, SPEED: ${speed}`);
    distanceText = JSON.stringify(distance);
    speedText = JSON.stringify(speed);
    playbackText = JSON.stringify(playing);
    negPlaybackText = JSON.stringify(negPlaying);
    volumeText = JSON.stringify(volume);
    avgDistText = JSON.stringify(avgDistance);
    caseText = JSON.stringify(caseNo);
    volText = JSON.stringify(vol);
    deltaText = JSON.stringify(delta);
  }

  return (
    <View style={styles.container}>
      <If condition={debug}>
        <Then>
          <Text>Current Location: {text}</Text>
          <Text>Current Speed: {speedText}</Text>
          <Text>Pos PlayBack Status: {playbackText}</Text>
          <Text>Neg PlayBack Status: {negPlaybackText}</Text>
          <Text>Volume: {volumeText}</Text>
          <Text>Case: {caseText}</Text>
          <Text>Distance from Renton, WA Applebees: {distanceText}</Text>
          <Text>avg Dist: {avgDistText}</Text>
          <Text>vol: {volText}</Text>
          <Text>delta: {deltaText}</Text>
          <Button title='CURRENT LOCATION' onPress={() => currentLocation()}></Button>
          <Button title='PLAY SOUND' onPress={debugSound}></Button>
          <Button title='STOP SONG' onPress={stopSound}></Button>
          <StatusBar style="auto" />
        </Then>
        <Else>
          <If condition={playing && !negPlaying && !debug}>
            <Then>
              <Image
              style={styles.backgroundImage}
              source={require('./assets/images/apple.gif')}
              />
            </Then>
            <Else>
            <Image
              style={styles.backgroundImage}
              source={require('./assets/images/sonic.jpg')}
            />
            </Else>
          </If>
        </Else>
      </If>
      <Button title=' DEBUG MENU' onPress={toggleDebug}></Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover', // or 'stretch'
  }
});



//tasks:

//console.log current location
  //done

//console.log specific location
//'geofencing'
//https://docs.expo.io/versions/v40.0.0/sdk/location/#locationregion

//console.log when moving north

//console.log when moving towards specific location

//
// Location.watchPositionAsync(options, callback)
// Subscribe to location updates from the device. Please note that updates will only occur while the application is in the foreground. To get location updates while in background you'll need to use Location.startLocationUpdatesAsync.



  //walking towards pos song playing:
  //if positive song is playing, and speed >.35, and dist =< avg dist
    //increase positive volume by x%

  //walking away pos song playing:
  //if positive song is playing, and speed <.35 and dist >= avg dist{
    //decrease positive volume by x%
 
  //walking towards neg song playing:
  //if neg song is playing, and speed >.35, and dist >= avg dist
    //increase neg volume by x%

  //walking away neg song playing:
  //if neg song is playing, and speed <.35 and dist =< avg dist{
    //decrease neg volume by x%

  //pos song playing, standing still
    //if pos song is playing, and speed <.35, and dist =< avg dist
    //decrease positive volume by x%

  //neg song playing, standing still
    //if neg song is playing, and speed <.35, and dist >= avg dist
    //decrease neg volume by x%

  //if volume is 0, and speed >.35, and dist >= avg dist
    //play positive song at 1% vol

  //if volume is 0, and speed >.35, and dist <= avg dist
  //play neg song at 1% vol

  //if vol = 0 pause song?


//   async function listenMovement(){
//     //use acceleromter to detect motion
//     let options = {
//       interval:200,

//     }
//     DeviceMotion.addListener(listener)
//     //if there is motion for  more than 3 seconds, fade in music

//       //if motion is positive, fade in pos music

//       //else fade in neg music

//     //if there is no motion for 3+ seconds, fade out music


//     // //How to loop?
//     // import { Audio } from ‘expo’
//     // const backgroundObject = new Audio.Sound()

//     // async play() {
//     // try {
//     // await backgroundObject.loadAsync(
//     // require(’…/assets/sounds/background001repeating.mp3’),
//     // { isLooping: true }
//     // )
//     // await backgroundObject.playAsync()
//     // } catch (error) {
//     // // An error occurred!
//     // }
// }

// async function speedPlay(speed){
//   if (speed < .35){
//     //if speed is less than .35 and distance is greater than avg dist
//     //     decrease volume by x%
//     //if volume = 0
//     //     pause song
//     //     set playing false
//     await sound.pauseAsync()
//     setPlaying(false);
//   }else if(speed >= .35 && !playing){
//     //if speed is greater than .35 and distance is less than avg distance
//     //fade in song

//     playSound();
//     setPlaying(true);
//   }
// }