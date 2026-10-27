import { siteConfig } from "@/lib/site-config";
import styles from "./profile-header.module.scss";
import { XAvatar } from "./x-avatar";

export function ProfileHeader({ updatedAt }: { updatedAt?: string }) {
  return (
    <header className={styles.header}>
      <p className={styles.brand}>ノベルティ交換所</p>
      <div className={styles.owner}>
        <XAvatar handle={siteConfig.xHandle} name={siteConfig.ownerName} />
        <div className={styles.ownerText}>
          <h1 className={styles.title}>{siteConfig.ownerName}のグッズ交換リスト</h1>
          <a
            href={`https://x.com/${siteConfig.xHandle}`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.handle}
          >
            @{siteConfig.xHandle}
          </a>
        </div>
      </div>
      <ul className={styles.rules}>
        {siteConfig.rules.map((rule) => (
          <li key={rule}>・{rule}</li>
        ))}
        {updatedAt && <li className={styles.updated}>最終更新 {updatedAt}</li>}
      </ul>
    </header>
  );
}
