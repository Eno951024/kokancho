/** 조건에 따라 클래스 이름을 이어 붙인다. 예: cx(styles.card, done && styles.done) */
export function cx(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
