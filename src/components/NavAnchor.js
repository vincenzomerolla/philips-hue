import React from 'react';

import { Link } from 'react-router-dom';
import Anchor from 'grommet/components/Anchor';

export default function NavAnchor({to, tag, ...props}) {
  return (
    <Link to={to}>
      <Anchor tag="span" {...props}/>
    </Link>
  );
}
