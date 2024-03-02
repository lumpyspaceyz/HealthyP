import { Rating } from '@/types';

export default function Review({
  rating,
  caseType,
}: {
  rating: Rating[];
  caseType: 'literal' | 'number';
}) {
  const count: number = rating.length ?? 0;

  const renderTextMap = {
    literal: (count: number) => `리뷰 ${count}개`,
    number: (count: number) => `(${count > 100 ? '100+' : count})`,
  };

  const renderText = renderTextMap[caseType](count);

  return (
    <>
      <p className="text-foot">{renderText}</p>
    </>
  );
}