import React from 'react';

import Header from 'grommet/components/Header';
import Menu from 'grommet/components/Menu';
import Sidebar from 'grommet/components/Sidebar';
import Title from 'grommet/components/Title';

import NavAnchor from './NavAnchor';


export default function NavSidebar(props) {
  return (
    <Sidebar colorIndex="neutral-3" size="small" fixed={true} full={true}>
      <Header pad='medium' justify='between'>
        <Title>
          Philips Hue
        </Title>
      </Header>
      <Menu primary>
        <NavAnchor to="/lights" className='active'>
          Lights
        </NavAnchor>
        <NavAnchor to="/scenes" >
          Scenes
        </NavAnchor>
        <NavAnchor to="/rooms">
          Rooms
        </NavAnchor>
      </Menu>
    </Sidebar>
  )
}
