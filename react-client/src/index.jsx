import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import List from './components/List.jsx';
import DrawableCanvas from 'react-drawable-canvas';
import '../assets/js/GIFEncoder.js';
import { encode64 } from '../assets/js/b64.js';
import '../assets/js/LZWEncoder.js';
import '../assets/js/NeuQuant.js';
import axios from 'axios';
import { apiConfig } from '../../config/config.js';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      brushColor: '#0033CC',
      lineWidth: 4,
      canvasStyle: {
        borderColor: '#786B6B',
        borderStyle: 'solid'
      },
      clear: false,
      accessToken: '',
      grabbingFrames: false,
    }
    this.handleOnClickClear = this.handleOnClickClear.bind(this);
    this.handleOnClickChangeColorRed = this.handleOnClickChangeColorRed.bind(this);
    this.handleOnClickChangeColorYellow = this.handleOnClickChangeColorYellow.bind(this);
    this.handleOnClickRecord = this.handleOnClickRecord.bind(this);
    this.handleOnClickDownload = this.handleOnClickDownload.bind(this);
    this.handleOnClickDone = this.handleOnClickDone.bind(this);
    this.getGyfcatToken();   
    this.encoder = new GIFEncoder();
  }

  componentDidMount() {
    const canvas = document.querySelector('canvas');
    //canvas.style.height = '300';
  }


  getGyfcatToken() {
    fetch('https://api.gfycat.com/v1/oauth/token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: "client_credentials",
        client_id: apiConfig.gyfcat.CLIENT_ID,
        client_secret: apiConfig.gyfcat.CLIENT_SECRET,
      })
    })
    .then((response) => response.json())
    .then((responseJson) => {
      console.log('token is ', responseJson.access_token);
      this.setState({ accessToken: responseJson.access_token });
    })
    .catch((error) => {
      console.error(error);
    });
  }

  uploadToGyfcat(binaryData) {
     fetch('https://api.gfycat.com/v1/gfycats', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.state.accessToken}`,
      },
    })
    .then((response) => response.json())
    .then((responseJson) => {
      console.log(responseJson.gfyname);
    })
    .catch((error) => {
      console.error(error);
    });
  }

  handleOnClickDownload() {
    this.encoder.download();
  }

  handleOnClickDone() {
    console.log('Finishing');
    this.encoder.finish();
    this.setState({ grabbingFrames: false });
    const binary_gif = this.encoder.stream().getData();
    const data_url = 'data:image/gif;base64,' + encode64(binary_gif);
    this.uploadToGyfcat(encode64(binary_gif), 'whatever.gif');
    const recordedImg = document.createElement('img');
    recordedImg.setAttribute("src", data_url);
    document.querySelector('.recordedGif').appendChild(recordedImg);
  }

  handleOnClickRecord() {
    document.querySelector('.recordedGif').innerHTML = '';
    console.log('Starting');
    const canvas = document.querySelector("canvas");
    const context = canvas.getContext('2d');
    context.fillStyle = 'rgb(255,255,255)';
    context.fillRect(0,0,canvas.width, canvas.height); //GIF can't do transparent so do white
    const grabRate  = 270; // Miliseconds. 500 = half a second
    let count     = 0;

    this.encoder.start();
    this.encoder.setRepeat(0);  //0  -> loop forever, 1+ -> loop n times then stop
    this.encoder.setDelay(0); //go to next frame every n milliseconds
    this.setState({ grabbingFrames: true });

    const grabber = setInterval(() => {
      if (!this.state.grabbingFrames) {
        clearInterval(grabber);
      } else {
        console.log('Grabbing '+count);
        count++;
        this.encoder.addFrame(context);
      }
    }, grabRate);
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
      brushColor: '#ff0000',
      clear: false
    });
  }

  render() {
    const buttonStyle = {
      margin: '5px'
    };

    const canvasContainerStyle = {
      margin: '10px'
    }

    const titleStyle = {
      margin: 'auto'
    }

    return (
      <div>
        <div>
          <h1 className="text-center">Your Drawing Canvas</h1>
        </div>
        <div style={canvasContainerStyle}>
          <DrawableCanvas {...this.state} />
        </div>
        <div>
          <button style={buttonStyle} type="button" className="btn btn-info" onClick={this.handleOnClickClear}>Clear all</button>
          <button style={buttonStyle} className="btn btn-info" onClick={this.handleOnClickChangeColorYellow}>Set color to Yellow</button>
          <button style={buttonStyle} className="btn btn-info" onClick={this.handleOnClickChangeColorRed}>Set color to Red</button>
          <button style={buttonStyle} className="btn btn-info" onClick={this.handleOnClickRecord}>Start Recording</button>
          <button style={buttonStyle} className="btn btn-info" onClick={this.handleOnClickDone}>Done Recording</button>
          <button style={buttonStyle} className="btn btn-info" onClick={this.handleOnClickDownload}>Download the recorded GIF file</button>
        </div>
        <br />
        <div className="recordedGif"></div>
      </div>
    );
  }
};

ReactDOM.render(<App />, document.getElementById('app'));