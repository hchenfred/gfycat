import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import List from './components/List.jsx';
import DrawableCanvas from 'react-drawable-canvas';
import '../assets/js/GIFEncoder.js';
import { encode64 } from '../assets/js/b64.js';
import '../assets/js/LZWEncoder.js';
import '../assets/js/NeuQuant.js';

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      brushColor: '#800909',
      lineWidth: 4,
      clear: false
    }
    this.handleOnClickClear = this.handleOnClickClear.bind(this);
    this.handleOnClickChangeColorRed = this.handleOnClickChangeColorRed.bind(this);
    this.handleOnClickChangeColorYellow = this.handleOnClickChangeColorYellow.bind(this);
    this.record = this.record.bind(this);
    fetch('https://api.gfycat.com/v1/oauth/token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: "client_credentials",
        client_id: "2_qkXVfQ",
        client_secret: "HxndaZS-nqmEQw_QytRiqblQCYGHRajFJ-2ElodyvmMQWeRfsWP8Zas14NY5BQ1U",
      })
    })
    .then((response) => response.json())
    .then((responseJson) => {
      console.log(responseJson);
        //return responseJson.movies;
    })
    .catch((error) => {
      console.error(error);
    });
  }

  record() {
    document.querySelector('.recordedGif').innerHTML = '';
    setTimeout(function() { // give external JS 1 second of time to load
    console.log('Starting');
    var canvas = document.querySelector("canvas");
    var context = canvas.getContext('2d');
    context.fillStyle = 'rgb(255,255,255)';
    context.fillRect(0,0,canvas.width, canvas.height); //GIF can't do transparent so do white
    var shots  = [];
    var grabLimit = 10;  // Number of screenshots to take
    var grabRate  = 270; // Miliseconds. 500 = half a second
    var count     = 0;

    function showResults() {
        console.log('Finishing');
        encoder.finish();
        var binary_gif = encoder.stream().getData();
        var data_url = 'data:image/gif;base64,' + encode64(binary_gif);
        //document.write('<img src="' +data_url + '"/>\n');
        var recordedImg = document.createElement('img');
        recordedImg.setAttribute("src", data_url);
        //console.log(recordedImg);
        document.querySelector('.recordedGif').appendChild(recordedImg);
    }


    var encoder = new GIFEncoder();
    encoder.start();
    encoder.setRepeat(0);  //0  -> loop forever, 1+ -> loop n times then stop
    encoder.setDelay(0); //go to next frame every n milliseconds

    var grabber = setInterval(function(){
      console.log('Grabbing '+count);
      count++;

      if (count>grabLimit) {
          clearInterval(grabber);
          showResults();
        }

      encoder.addFrame(context);

      }, grabRate);
    }, 1000);
  }

  handleOnClickClear() {
    
    this.setState({
      clear: true
    });
  }

  handleOnClickChangeColorYellow() {
    this.setState({
      brushColor: '#ffff00',
      clear: false
    });
  }

  handleOnClickChangeColorRed(){
    this.setState({
      brushColor: '#800909',
      clear: false
    });
  }

  render() {
    return (
      <div>
        <DrawableCanvas {...this.state} />
        <button onClick={this.handleOnClickClear}>Clear all</button>
        <button onClick={this.handleOnClickChangeColorYellow}>Set color to Yellow</button>
        <button onClick={this.handleOnClickChangeColorRed}>Set color to Red</button>
        <button onClick={this.record}>Record to GIF</button>
        <div className="recordedGif">hello</div>
      </div>
    );
  }
};

ReactDOM.render(<App />, document.getElementById('app'));