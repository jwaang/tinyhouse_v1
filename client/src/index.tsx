import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import ReactDOM from 'react-dom';
import { AppHeader, Home, Host, Listing, Login, Listings, NotFound, User } from './sections';
import ApolloClient from 'apollo-boost';
import { ApolloProvider, useMutation } from 'react-apollo';
import reportWebVitals from './reportWebVitals';
import { Affix, Layout, Spin } from 'antd';
import { AppHeaderSkeleton, ErrorBanner } from './lib/components';
import { Viewer } from './lib/types';
import { LOG_IN } from './lib/graphql/mutations';
import { LogIn as LogInData, LogInVariables} from './lib/graphql/mutations/LogIn/__generated__/LogIn';
import './styles/index.css';

const client = new ApolloClient({
  uri: '/api',
  request: async operation => {
    const token = sessionStorage.getItem('token');
    operation.setContext({
      headers: {
        'X-CSRF-TOKEN': token || '',
      }
    })
  }
});

const initialviewer: Viewer = {
  id: null,
  token: null,
  avatar: null,
  hasWallet: null,
  didRequest: false
}

const App = () => {
  const [viewer, setViewer] = useState<Viewer>(initialviewer);
  const [logIn, { error }] = useMutation<LogInData, LogInVariables>(LOG_IN, {
    onCompleted: data => {
      if (data && data.logIn) {
        setViewer(data.logIn);

        if(data.logIn.token) {
          sessionStorage.setItem('token', data.logIn.token);
        } else {
          sessionStorage.removeItem('token');
        }
      }
    }
  });

  const logInRef = useRef(logIn);

  useEffect(() => {
    logInRef.current();
  }, []);

  if (!viewer.didRequest && !error) {
    <Layout className='app-skeleton'>
      <AppHeaderSkeleton />
      <div className='app-skeleton__spin-section'>
        <Spin size='large' tip='Launching TinyHouse' />
      </div>
    </Layout>
  }

  const logInErrorBannerElement = error ? (
    <ErrorBanner description="We weren't able to verify if you were logged in. Please try again later" />
  ) : null;

  return (
    <Router>
      <Layout id="app">
        {logInErrorBannerElement}
        <Affix offsetTop={0} className="app__affix-header">
          <AppHeader viewer={viewer} setViewer={setViewer} />
        </Affix>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/host" component={Host} />
          <Route exact path="/listing/:id" component={Listing} />
          <Route exact path="/listings/:location?" component={Listings} />
          <Route
            exact
            path="/login"
            render={props => <Login {...props} setViewer={setViewer} />}
          />
          <Route exact path="/user/:id" component={User} />
          <Route component={NotFound} />
        </Switch>
      </Layout>
    </Router>
  )
}

ReactDOM.render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
