#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { SolutionConstructExampleStack } from '../lib/solution-construct-example-stack';

const app = new cdk.App();
new SolutionConstructExampleStack(app, 'SolutionConstructExampleStack');
