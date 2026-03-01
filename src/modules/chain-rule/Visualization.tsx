'use client';

import React from 'react';
import { ComputationGraph, type ComputationGraphProps } from './ComputationGraph';
import {
  FunctionMachine, type FunctionMachineProps,
  RateMultiplier, type RateMultiplierProps,
  ChainCalculator, type ChainCalculatorProps,
} from './Helpers';

type ChainVizProps = { component?: string }
  & ComputationGraphProps
  & FunctionMachineProps
  & RateMultiplierProps
  & ChainCalculatorProps;

export function ChainRuleViz({ component = 'ComputationGraph', ...rest }: ChainVizProps) {
  if (component === 'FunctionMachine') return <FunctionMachine {...rest as FunctionMachineProps} />;
  if (component === 'RateMultiplier') return <RateMultiplier {...rest as RateMultiplierProps} />;
  if (component === 'ChainCalculator') return <ChainCalculator {...rest as ChainCalculatorProps} />;
  return <ComputationGraph {...rest as ComputationGraphProps} />;
}
