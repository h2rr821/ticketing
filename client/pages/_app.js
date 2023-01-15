import 'bootstrap/dist/css/bootstrap.css';
import buildClient from '../api/build-client';
import Header from '../components/header';

const AppComponent = ({ Component, pageProps, currentUser }) => {
    return (
        <div>
            <Header currentUser={currentUser} />
            <div className="container">
                <Component currentUser={currentUser} {...pageProps} />
            </div>    
        </div>);
};

AppComponent.getInitialProps = async (appContext) => {

    // console.log('appContext: ', appContext);
    // return {};
    const client = buildClient(appContext.ctx);
    const { data } = await client.get('/api/users/currentuser');

    let pageProps = {};

    if (appContext.Component.getInitialProps) {
        pageProps = await appContext.Component.getInitialProps(appContext.ctx, client, data.currentUser);
    }

    console.log(pageProps);

    console.log("appComponent: ", data);
    return {

        pageProps,
        currentUser: data.currentUser
    }
    

};

export default AppComponent;