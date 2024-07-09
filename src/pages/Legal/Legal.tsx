import styles from "./Legal.module.css";

export default function Legal({
    animation,
}: {
    animation: { [_: string]: string };
}) {
    const className = Object.keys(animation).includes("/legal")
        ? animation["/legal"]
        : "";
    return (
        <div id={styles.container} className={className}>
            <h1>© {new Date().getFullYear()} Flavian Züllig</h1>
        </div>
    );
}
