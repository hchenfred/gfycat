import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import List from './components/List.jsx';
import DrawableCanvas from 'react-drawable-canvas';

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      brushColor: '#800909',
      lineWidth: 4,
      canvasStyle: {
        backgroundColor: '#00FFDC'
      },
      clear: false
    }
    this.handleOnClickClear = this.handleOnClickClear.bind(this);
    this.handleOnClickChangeColorRed = this.handleOnClickChangeColorRed.bind(this);
    this.handleOnClickChangeColorYellow = this.handleOnClickChangeColorYellow.bind(this);
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
      </div>
    );
  }
};

ReactDOM.render(<App />, document.getElementById('app'));