import { useEffect, useState } from "react";
import styles from "./Age.module.css";

export default function Age({
    animation,
}: {
    animation: { [_: string]: string };
}) {
    const [duration, setDuration] = useState(Date.now() - 1189773720000);
    const className = Object.keys(animation).includes("/age")
        ? animation["/age"]
        : "";

    useEffect(() => {
        const interval = setInterval(() => {
            setDuration(Date.now() - 1189773720000);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className={className}>
            <h2>I'm</h2>
            <h1 id={styles.title}>
                <>
                    {Math.floor(duration / (1000 * 3600 * 24 * 365.25))}{" "}
                    <span className={styles.unit}>years</span>{" "}
                </>
                <>
                    {Math.floor(
                        (duration % (1000 * 3600 * 24 * 365.25)) /
                            (1000 * 3600 * 24),
                    )}{" "}
                    <span className={styles.unit}>days</span>{" "}
                </>
                <span>
                    {Math.floor(
                        (duration % (1000 * 3600 * 24)) / (1000 * 3600),
                    )}{" "}
                    <span className={styles.unit}>hours</span>{" "}
                </span>
                <>
                    {Math.floor((duration % (1000 * 3600)) / 60000)}{" "}
                    <span className={styles.unit}>minutes</span>{" "}
                </>
                <>
                    {Math.floor((duration % (1000 * 60)) / 1000)}{" "}
                    <span className={styles.unit}>seconds</span>
                </>
            </h1>
            <h2>old</h2>
        </div>
    );
}
