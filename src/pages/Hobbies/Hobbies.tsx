export default function Hobbies({
    animation,
}: {
    animation: { [_: string]: string };
}) {
    const className = Object.keys(animation).includes("/hobbies")
        ? animation["/hobbies"]
        : "";
    return (
        <div className={className}>
            <h1>HOBBIES</h1>
        </div>
    );
}
