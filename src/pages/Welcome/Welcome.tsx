import styles from "./Welcome.module.css";
import "./Welcome.module.css";
import pixeled from "../../assets/pixel-portrait.png";
import clear from "../../assets/clear-portrait.jpg";

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
                <h1 className={styles.title}>Hi.</h1>
                <h2 className={styles.subTitle}>I'm Flavian.</h2>
                <h3 className={styles.description}>
                    Free time developer and tech enjoyer.
                </h3>
            </div>
            <img className={styles.portrait} src={clear} alt="A pic of me" />
            <img
                className={styles.pixel + " " + styles.portrait}
                src={pixeled}
                alt="A pic of me"
            />
        </div>
    );
}
