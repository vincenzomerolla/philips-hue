import React, { Component } from 'react';
import { get, post, put } from 'axios';
import localforage from 'localforage';

import { default as Container } from 'grommet/components/App';
import Anchor from 'grommet/components/Anchor';
import Article from 'grommet/components/Article';
import Box from 'grommet/components/Box';
import Button from 'grommet/components/Button';
import Card from 'grommet/components/Card';
import CheckBox from 'grommet/components/CheckBox';
import Header from 'grommet/components/Header';
import Menu from 'grommet/components/Menu';
import Notification from 'grommet/components/Notification';
import Sidebar from 'grommet/components/Sidebar';
import Split from 'grommet/components/Split';
import Title from 'grommet/components/Title';
import Tiles from 'grommet/components/Tiles';
import Tile from 'grommet/components/Tile';


import { CirclePicker } from 'react-color';

function xyzToRgb(x, y, bri) {
    let z = 1.0 - x - y;

    let Y = bri / 255.0; // Brightness of lamp
    let X = (Y / y) * x;
    let Z = (Y / y) * z;
    let r = X * 1.612 - Y * 0.203 - Z * 0.302;
    let g = -X * 0.509 + Y * 1.412 + Z * 0.066;
    let b = X * 0.026 - Y * 0.072 + Z * 0.962;
    r = r <= 0.0031308 ? 12.92 * r : (1.0 + 0.055) * Math.pow(r, (1.0 / 2.4)) - 0.055;
    g = g <= 0.0031308 ? 12.92 * g : (1.0 + 0.055) * Math.pow(g, (1.0 / 2.4)) - 0.055;
    b = b <= 0.0031308 ? 12.92 * b : (1.0 + 0.055) * Math.pow(b, (1.0 / 2.4)) - 0.055;
    let maxValue = Math.max(r,g,b);
    r /= maxValue;
    g /= maxValue;
    b /= maxValue;
    r *= 255;   if (r < 0) { r = 255 };
    g *= 255;   if (g < 0) { g = 255 };
    b *= 255;   if (b < 0) { b = 255 };

    r = Math.round(r).toString(16);
    g = Math.round(g).toString(16);
    b = Math.round(b).toString(16);

    if (r.length < 2)
        r="0"+r;
    if (g.length < 2)
        g="0"+g;
    if (b.length < 2)
        b="0"+r;
    let rgb = "#"+r+g+b;

    return rgb;
}

function rgbToXyz(rgb) {
  let { r, g, b } = rgb;
  let X, Y, Z, x, y;
  // console.log(color)

  r = +(r/255).toPrecision(2);
  g = +(g/255).toPrecision(2);
  b = +(b/255).toPrecision(2);

  console.log(r,g,b)

  r = (r > 0.04045) ? Math.pow((r + 0.055) / (1.0 + 0.055), 2.4) : (r / 12.92);
  g = (g > 0.04045) ? Math.pow((g + 0.055) / (1.0 + 0.055), 2.4) : (g / 12.92);
  b = (b > 0.04045) ? Math.pow((b + 0.055) / (1.0 + 0.055), 2.4) : (b / 12.92);

  console.log(r,g,b)

  X = r * 0.664511 + g * 0.154324 + b * 0.162028;
  Y = r * 0.283881 + g * 0.668433 + b * 0.047685;
  Z = r * 0.000088 + g * 0.072310 + b * 0.986039;

  console.log(X,Y,Z)

  x = X / (X + Y + Z);
  y = Y / (X + Y + Z);

  console.log(x,y)
  return { x, y, z: Y };
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      bridges: [],
      user: null,
      lights: null,
      error: ''
    }
  }

  componentDidMount() {
    localforage
      .getItem('user')
      .then(user => {
        if (user) {
          this.setState({ user })

          get(`http://${user.host}/api/${user.username}/lights`)
            .then(({data}) => {
              this.setState({ lights: data})
            })
        }
      })

    document.addEventListener('keydown', (e) => {
      let { host, username } = this.state.user;
      let { key } = e;

      put(`http://${host}/api/${username}/lights/${key}/state`, {
        on: true,
      })
    })

    document.addEventListener('keyup', (e) => {
      let { host, username } = this.state.user;
      let { key } = e;

      put(`http://${host}/api/${username}/lights/${key}/state`, {
        on: false,
      })
    })
  }

  handleClick = () => {
    get('https://www.meethue.com/api/nupnp')
      .then(({data}) => {
        this.setState({bridges: data})
      })
  }

  handleBridgeSelect = ({internalipaddress}) => {
    post(`http://${internalipaddress}/api`, {
      devicetype: 'musical_hues#macbook vincenzo'
    })
    .then((res) => {
      let [ data ] = res.data;
      console.log(data)
      if (data.error) {
        this.setState({ error: data.error.description})
      } else {
        return localforage.setItem('user', {
          host: internalipaddress,
          username: data.success.username,
        })
      }
    }, err => {
      console.error(err)
    })

    .catch(e => console.error(e))
    .then(user => {
      this.setState({ user })
    })
    // post('/register', {
    //   host: internalipaddress,
    // })
    // .then(({data}) => {
    //   return Promise.all([
    //     localforage.setItem('user', data),
    //     localforage.setItem('host', internalipaddress)
    //   ]);
    // })
    // .then(user => {
    //   this.setState({ user })
    // })
  }

  handleLightChange(id) {
    let { user } = this.state;
    let on = !this.state.lights[id].state.on;
    put(`http://${user.host}/api/${user.username}/lights/${id}/state`, {
      on,
    })
    .then(({data}) => {

      let lights = Object.assign({}, this.state.lights);
      console.log(lights)
      lights[id].state.on = on;
      this.setState({ lights })
    })
  }

  handleColorChange(id, {rgb}) {
    console.log(rgb)
    let { user } = this.state;

    let {x, y, z} = rgbToXyz(rgb);

    put(`http://${user.host}/api/${user.username}/lights/${id}/state`, {
      xy: [x, y],
      // bri: z * 255
    })
  }

  getBridges() {
    let tiles =  this.state.bridges.map((b) => {
      let {id, internalipaddress} = b;
      return (
        <Tile
          onClick={e=> this.handleBridgeSelect(b)}
          key={id}>
          <Card
            label={id}
            heading={internalipaddress}/>
        </Tile>
      )
    })

    return <Tiles fill selectable> {tiles} </Tiles>
  }

  render() {
    let { bridges, user, lights, error } = this.state;
    return (
      <Container centered={false}>
        <Split fixed={true} flex="right">
          <Sidebar colorIndex="neutral-3" size="small" fixed={true} full={true}>
            <Header pad='medium' justify='between'>
              <Title>
                Philips Hue
              </Title>
            </Header>
            <Menu primary>
              <Anchor href='#' className='active'>
                Lights
              </Anchor>
              <Anchor href='#'>
                Scenes
              </Anchor>
              <Anchor href='#'>
                Rooms
              </Anchor>
            </Menu>
          </Sidebar>
          <Article>
            <Box pad="medium">
              {
                error &&
                <Notification
                  message={error}
                  size="medium"
                  status="warning" />
              }

              {
                user ?
                <code>{JSON.stringify(user, null, 2)}</code>:
                <Box>
                  <Button primary label="Search for Hue" onClick={this.handleClick} />
                  {
                    bridges.length > 0 ? this.getBridges() : 'Search for a Philips Hue bridge.'
                  }
                </Box>
              }


              {

                lights && Object.keys(lights).map(key => {
                  let { name, uniqeid, state } = lights[key];
                  console.log(lights[key])
                  let color = xyzToRgb(...state.xy, state.bri);
                  return (
                    <Box>
                      <CheckBox
                        key={uniqeid}
                        checked={state.on}
                        label={name}
                        toggle={true}
                        onChange={()=>this.handleLightChange(key)}/>
                      <input
                        type="range"
                        min={1} max={254} step={1}
                        value={state.bri} />
                      <CirclePicker
                        color={color}
                        colors={[color, "#e91e63", "#9c27b0", "#673ab7", "#3f51b5", "#2196f3"]}
                        onChange={c => this.handleColorChange(key, c)}/>
                    </Box>
                  );
                })
              }
            </Box>




          </Article>
        </Split>
      </Container>
    );
  }
}

export default App;
