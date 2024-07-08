import styles from "./Welcome.module.css";
import "./Welcome.module.css";

export default function Welcome({
    animation,
}: {
    animation: { [_: string]: string };
}) {
    const className = Object.keys(animation).includes("/")
        ? animation["/"]
        : "";
    return (
        <div className={styles.container + " " + className}>
            <div className={styles.textContainer}>
                <h1 className={styles.title}>Hi👋</h1>
                <h2 className={styles.subTitle}>I'm Flavian.</h2>
            </div>
            <img
                className={styles.portrait}
                src="/public/pixel-portrait.png"
                alt="A pic of me"
            />
        </div>
    );
}
