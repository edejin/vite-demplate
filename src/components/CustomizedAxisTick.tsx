import React from 'react';

interface Props {
  x?: number;
  y?: number;
  payload?: {
    value: string;
  };
  type?: 'x' | 'y';
  visibleTicksCount?: number;
  index?: number;
}

export const CustomizedAxisTick: React.FC<Props> = (props: Props) => {
  const {
    x = 0,
    y = 0,
    payload = {
      value: ''
    },
    type = 'x',
    index = 0,
    visibleTicksCount = 0
  } = props;

  const last = index === visibleTicksCount - 1;

  if (type === 'x') {
    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={0}
          dy={16}
          {...(last ? {textAnchor: "end"} : {})}
          // fill="#FFEECA"
          fontStyle={'normal'}
          fontWeight={400}
          fontSize={'15px'}
        >
          {payload.value}
        </text>
      </g>
    );
  }
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        {...(last ? {dy: 16} : {})}
        textAnchor="end"
        // fill="#FFEECA"
        fontStyle={'normal'}
        fontWeight={400}
        fontSize={'15px'}
      >
        {payload.value}
      </text>
    </g>
  );
};
