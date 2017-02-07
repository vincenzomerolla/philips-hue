import React, { Component } from 'react';
import { get, post } from 'axios';
import localforage from 'localforage';

import { default as Container } from 'grommet/components/App';
import Article from 'grommet/components/Article';
import Box from 'grommet/components/Box';
import Button from 'grommet/components/Button';
import Card from 'grommet/components/Card';
import Notification from 'grommet/components/Notification';
import Tiles from 'grommet/components/Tiles';
import Tile from 'grommet/components/Tile';

import { discover, Client } from 'huejay';



export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      bridges: [],
      user: null,
      error: ''
    }
  }

  componentDidMount() {
    // localforage
    //   .getItem('user')
    //   .then(user => {
    //     if (user) {
    //       this.setState({ user })
    //
    //       get(`http://${user.host}/api/${user.username}/lights`)
    //         .then(({data}) => {
    //           this.setState({ lights: data})
    //         })
    //     }
    //   })
    console.log(this.props)
  }

  handleClick = () => {

    discover().then(({ data }) => {
      this.setState({ bridges: data })
    }).catch( err => {
      console.log(`An error occurred: ${err.message}`);
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
    let { bridges, user, error } = this.state;
    return (
      <Container centered>
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



          </Box>
        </Article>
      </Container>
    );
  }
}
