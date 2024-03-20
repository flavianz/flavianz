import styles from "./Run.module.css";
import { run } from "emojido";
import { useState } from "react";

export default function Run() {
    const [input, setInput] = useState("");
    return (
        <div className={styles.container}>
            <div>
                <h1 className={styles.title}>Run emojido</h1>
                <button onClick={() => run(input)}></button>
            </div>
            <div className={styles.windows}>
                <div className={styles.fieldContainer}>
                    <h2>Code</h2>
                    <textarea
                        value={input}
                        className={styles.field}
                        onChange={(e) => setInput(e.target.value)}
                        spellCheck={false}
                    />
                </div>
                <div className={styles.fieldContainer}>
                    <h2>Output</h2>
                    <textarea
                        className={`${styles.field} ${styles.output}`}
                        spellCheck={false}
                        readOnly={true}
                    ></textarea>
                </div>
            </div>
        </div>
    );
}
