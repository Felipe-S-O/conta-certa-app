import Container from "@/components/container";
import TopNav from "@/components/nav/top-nav";

const Dashboard = () => {
    return (<div>
        <TopNav title="Dashboard" />
        <div className="grid grid-cols-1 divide-y border-b border-border lg:grid-cols-3 lg:divide-x lg:divide-y-0 lg:divide-border">
            <Container className="py-4 lg:col-span-2">
                <h1>testet</h1>
            </Container>
            <Container className="py-4 lg:col-span-1">
                <h2>teste</h2>
            </Container>
        </div>
    </div>);
}

export default Dashboard;