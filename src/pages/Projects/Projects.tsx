export default function Projects({
    animation,
}: {
    animation: { [_: string]: string };
}) {
    console.log(animation);
    const className = Object.keys(animation).includes("/projects")
        ? animation["/projects"]
        : "";
    return (
        <div className={className}>
            <h1>he</h1>
        </div>
    );
}
