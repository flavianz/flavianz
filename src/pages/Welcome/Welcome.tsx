import styles from "./Welcome.module.css";
import "./Welcome.module.css";

export default function Welcome() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Hi👋</h1>
      <h2 className={styles.subTitle}>I'm Flavian.</h2>
    </div>
  );
}
