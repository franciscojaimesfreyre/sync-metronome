import ReactDom from "react-dom";
import React, { useState } from "react";
import { Model } from "@croquet/croquet";
import {
  usePublish,
  useModelRoot,
  InCroquetSession,
  useSubscribe
} from "@croquet/react";
import Metronome from "./metronome";

class CounterModel extends Model {
  init(option) {
    super.init(option);
    this.count = 0;
    this.future(1000).tick();
    this.subscribe(this.id, "reset", this.resetCounter);
  }

  resetCounter() {
    this.count = 0;
    this.publish(this.id, "count");
  }

  tick() {
    this.count += 1;
    this.publish(this.id, "count");
    this.future(1000).tick();
  }
}

class MetronomeModel extends Model {
  init(option) {
    super.init(option);
    this.playing = false;
    this.count = 0;
    this.bpm = 100;
    this.future((60 / this.bpm) * 1000).click();
    this.subscribe(this.id, 'start', this.handleStart);
    this.subscribe(this.id, 'stop', this.handleStop);
    this.subscribe(this.id, 'changeBpm', this.handleBpmChange)
  }

  handleStart() {
    this.playing = true;
    this.publish(this.id, 'started');
  }

  handleStop() {
    this.playing = false;
    this.publish(this.id, 'stopped')
  }

  handleBpmChange(data) {
    const {bpm} = data;
    this.bpm = bpm;
    this.publish(this.id, 'bpmChanged', {bpm: this.bpm})
  }

  click() {
    this.count += 1;
    this.future((60 / this.bpm) * 1000).click();
    this.publish(this.id, 'click', {count: this.count, bpm: this.bpm});
  }
}

MetronomeModel.register("MetronomeModel");

function CounterApp() {
  const [sessionName, setSessionName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  function createCroquetSession(aSessionName) {
    if (!!aSessionName) {
      return (
        <InCroquetSession
          apiKey='1151uD4J7lg1c2rCHxfpmu2ihnu3KefMFuAjCEcG5'
          appId='com.banana-software.francisco.freyre.metronome'
          password="abc"
          name={sessionName}
          model={MetronomeModel}
        >
          <Metronome />
        </InCroquetSession>
      );
    }
  }
  return (
    <div>
      <input type="text" style={{fontSize: '2em', marginRight: '.5em'}} onChange={e => {
        setSubmitted(false);
        setSessionName(e.target.value);
      }} />
      <button style={{fontSize: '2em'}} onClick={_ => setSubmitted(true)} disabled={!sessionName}>ok</button>
      {submitted && createCroquetSession(sessionName)}
    </div>
  );
}

function CounterDisplay() {
  const model = useModelRoot();
  const [count, setCount] = useState(model.count);

  useSubscribe(model.id, "count", () => setCount(model.count), []);

  const publishReset = usePublish(() => [model.id, "reset"], []);

  return (
    <div
      onClick={publishReset}
      style={{ margin: "1em", fontSize: "3em", cursor: "pointer" }}
    >
      {count}
    </div>
  );
}

function MetronomeDisplay() {
  const model = useModelRoot();

  useSubscribe(model.id, "bpmChanged", () => console.log(model.bpm), []);

  const start = usePublish(() => [model.id, "start"]);
  const stop = usePublish(() => [model.id, "stop"]);
  const changeBpm = usePublish(() => [model.id, "changeBpm", {bpm: 120}]);

  return (
    <div
      onClick={publishReset}
      style={{ margin: "1em", fontSize: "3em", cursor: "pointer" }}
    >
      {count}
    </div>
  );
}

ReactDom.render(<CounterApp />, document.getElementById("app"));