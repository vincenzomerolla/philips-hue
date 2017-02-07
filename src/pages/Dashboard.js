import React, { Component } from 'react';
import { get, post, put } from 'axios';
import localforage from 'localforage';

import { CirclePicker } from 'react-color';
import { default as Container } from 'grommet/components/App';
import Article from 'grommet/components/Article';
import Box from 'grommet/components/Box';
import Button from 'grommet/components/Button';
import Card from 'grommet/components/Card';
import CheckBox from 'grommet/components/CheckBox';
import Notification from 'grommet/components/Notification';
import Split from 'grommet/components/Split';
import Tiles from 'grommet/components/Tiles';
import Tile from 'grommet/components/Tile';


import NavSidebar from '../components/NavSidebar';

import { xyzToRgb, rgbToXyz } from '../utils';

export default class Dashboard extends Component {
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
          <NavSidebar />
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
