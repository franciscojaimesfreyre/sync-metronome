import React, { useState, useEffect } from 'react';
import "./metronome.css";
import { Model } from "@croquet/croquet";
import {
  usePublish,
  useModelRoot,
  useSubscribe
} from "@croquet/react";

const click1 = new Audio("//daveceddia.com/freebies/react-metronome/click1.wav");
const click2 = new Audio("//daveceddia.com/freebies/react-metronome/click2.wav");

const Metronome = () => {
  const [playing, setPlaying] = useState(false);
  const [bpm, setBpm] = useState(100);
  const [timer, setTimer] = useState(null);
  const beatsPerMeasure = 3;

  const model = useModelRoot();

  useSubscribe(model.id, "click", () => playClick(), []);
  useSubscribe(model.id, "bpmChanged", () => setBpm(model.bpm), []);
  useSubscribe(model.id, "started", () => handleStart(), []);
  useSubscribe(model.id, "stopped", () => handleStop(), []);

  const start = usePublish(() => [model.id, "start"]);
  const stop = usePublish(() => [model.id, "stop"]);
  const changeBpm = usePublish(() => [model.id, "changeBpm", {bpm: bpm}]);
  
  
  const playClick = () => {
    console.log(model)
    if (!model.playing) return;
    if (model.count % beatsPerMeasure === 0) {
      // Play sound 2
      click1.play()
    } else {
      // Play sound 1
      click2.play()
    }
  };

  // useEffect(() => {
  //   if (playing) {
  //     clearInterval(timer);
  //     setTimer(setInterval(playClick, (60 / bpm) * 1000));
  //   } else {
  //     clearInterval(timer);
  //   }

  //   return () => clearInterval(timer);
  // }, [playing]);

  useEffect(() => {
    stop();
    changeBpm();
  }, [bpm]);

  function handleBpmChange(event) {
    const newBpm = event.target.value;
    if (playing) {
      handleStop();
      setBpm(newBpm);
      handleStart();
    } else {
      setBpm(newBpm);
    }
  };

  function handleStart() {
    setPlaying(true);
  }

  function handleStop() {
    setPlaying(false);
  }

  

  return (
    <div className="metronome">
      <div className="bpm-slider">
        <div>{bpm} BPM</div>
        <input
          type="range"
          min="60"
          max="240"
          value={bpm}
          onChange={handleBpmChange}
        />
      </div>
      <button onClick={playing? stop : start}>{playing ? 'Stop' : 'Start'}</button>
    </div>
  );
};

export default Metronome;
