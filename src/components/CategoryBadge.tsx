import type { Category } from '../types';
import { CATEGORY_META } from '../types';

export default function CategoryBadge({ category }: { category: Category }) {
  const meta = CATEGORY_META[category];
  return (
    <span className={`badge ${meta.color}`}>
      <span aria-hidden>{meta.icon}</span>
      {meta.label}
    </span>
  );
}
