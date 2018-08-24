/* eslint no-console:0 */
// This file is automatically compiled by Webpack, along with any other files
// present in this directory. You're encouraged to place your actual application logic in
// a relevant structure within app/javascript and only use these pack files to reference
// that code so it'll be compiled.
//
// To reference this file, add <%= javascript_pack_tag 'application' %> to the appropriate
// layout file, like app/views/layouts/application.html.erb


import Scanner from 'components/Scanner';
import Badge from 'components/Badge';
import Help from 'components/Help';
import Home from 'components/Home';
import Users from 'components/users/users';

import WebpackerReact from 'webpacker-react';

WebpackerReact.setup({Scanner});
WebpackerReact.setup({Badge});
WebpackerReact.setup({Help});
WebpackerReact.setup({Home});
WebpackerReact.setup({Users});;