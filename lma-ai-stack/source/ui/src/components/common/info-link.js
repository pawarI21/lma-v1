// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React from 'react';
import { Link } from '@awsui/components-react';

export const InfoLink = ({ id, onFollow }) => (
  <Link variant="info" id={id} onFollow={onFollow}>
    Info
  </Link>
);

export default InfoLink;
