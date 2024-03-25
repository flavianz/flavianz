import styles from "./Home.module.css"
import Header from "../../components/Header/Header.tsx";

export default function Home()
{
    return <div className={styles.container}>
        <Header/>
        <div className={styles.contentContainer}><h1>Flavian</h1></div>
    </div>
}