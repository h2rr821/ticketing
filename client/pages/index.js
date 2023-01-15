// import buildClient from '../api/build-client';
import Link from 'next/link';

const LandingPage = ({ currentUser, tickets }) => {

    console.log("currentuser", currentUser);
    console.log("tickets", tickets);
    // axios.get('/api/users/currentuser').catch((err) => {
    //     console.log("err", err.message);
    // });

    // return currentUser ? (<h1>You are signed in</h1>) : (<h1>You are NOT signed in</h1>);

    const ticketList = tickets.map(ticket => {
        return (
            <tr key={ticket.id}>
                <td>{ticket.title}</td>
                <td>{ticket.price}</td>
                <td>
                    <Link legacyBehavior href="/tickets/[ticketId]" as={`/tickets/${ticket.id}`}>
                        <a>View</a>
                    </Link>
                </td>
            </tr>
        );
    });

    return (
        <div>
            <h1>Tickets</h1>
            <table className="table">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Price</th>
                        <th>Link</th>
                    </tr>
                </thead>
                <tbody>
                    {ticketList}
                </tbody>
            </table>
        </div>
    )
};

LandingPage.getInitialProps = async (context, client, currentUser) => {

    // console.log(context);
    // console.log(req.headers);
    // if (typeof window === 'undefined') {
    //     // we are on server
    //     const { data } = await axios.get(
    //         'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local/api/users/currentuser', {
    //             headers: req.headers
    //         }
    //     );
    //     return data;

    // } else {
    //     // we are on client
    //     const { data } = await axios.get('/api/users/currentuser');
    //     return data;
    // }

    // const client = buildClient(context);
    // const { data } = await client.get('/api/users/currentuser');
    // return data;
    const { data } = await client.get('/api/tickets');

    return { tickets: data };
    
};

export default LandingPage;
