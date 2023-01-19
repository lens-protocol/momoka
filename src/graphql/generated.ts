import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  BigInt: any;
};

export type Account = {
  __typename?: 'Account';
  balance: Scalars['BigInt'];
  transactions?: Maybe<BalanceTransactionConnection>;
  withdrawals: Scalars['Int'];
};

export type BalanceTransaction = {
  __typename?: 'BalanceTransaction';
  amount: Scalars['BigInt'];
  block_height: Scalars['BigInt'];
  confirmed: Scalars['Boolean'];
  tx_id: Scalars['String'];
};

export type BalanceTransactionConnection = {
  __typename?: 'BalanceTransactionConnection';
  edges?: Maybe<Array<Maybe<BalanceTransactionEdge>>>;
  pageInfo?: Maybe<PageInfo>;
};

export type BalanceTransactionEdge = {
  __typename?: 'BalanceTransactionEdge';
  cursor: Scalars['String'];
  node: BalanceTransaction;
};

export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor?: Maybe<Scalars['String']>;
  hasNextPage: Scalars['Boolean'];
};

export type Query = {
  __typename?: 'Query';
  account?: Maybe<Account>;
  transactions?: Maybe<TransactionConnection>;
};


export type QueryAccountArgs = {
  address: Scalars['String'];
  after?: InputMaybe<Scalars['String']>;
  currency: Scalars['String'];
  limit?: InputMaybe<Scalars['Int']>;
};


export type QueryTransactionsArgs = {
  after?: InputMaybe<Scalars['String']>;
  hasTags?: InputMaybe<Scalars['Boolean']>;
  ids?: InputMaybe<Array<Scalars['String']>>;
  limit?: InputMaybe<Scalars['Int']>;
  order?: InputMaybe<SortOrder>;
  owners?: InputMaybe<Array<Scalars['String']>>;
};

export enum SortOrder {
  Asc = 'ASC',
  Desc = 'DESC'
}

export type Transaction = {
  __typename?: 'Transaction';
  address: Scalars['String'];
  current_block: Scalars['BigInt'];
  expected_block: Scalars['BigInt'];
  fee: Scalars['String'];
  id: Scalars['String'];
  signature: Scalars['String'];
  timestamp: Scalars['BigInt'];
  unit: Scalars['String'];
};

export type TransactionConnection = {
  __typename?: 'TransactionConnection';
  edges?: Maybe<Array<Maybe<TransactionEdge>>>;
  pageInfo?: Maybe<PageInfo>;
};

export type TransactionEdge = {
  __typename?: 'TransactionEdge';
  cursor: Scalars['String'];
  node: Transaction;
};

export type DataAvailabilityTransactionsQueryVariables = Exact<{
  owners?: InputMaybe<Array<Scalars['String']> | Scalars['String']>;
  limit?: InputMaybe<Scalars['Int']>;
  after?: InputMaybe<Scalars['String']>;
}>;


export type DataAvailabilityTransactionsQuery = { __typename?: 'Query', transactions?: { __typename?: 'TransactionConnection', edges?: Array<{ __typename?: 'TransactionEdge', cursor: string, node: { __typename?: 'Transaction', id: string, address: string } } | null> | null, pageInfo?: { __typename?: 'PageInfo', endCursor?: string | null, hasNextPage: boolean } | null } | null };

export type TransactionOwnersQueryVariables = Exact<{
  id: Scalars['String'];
}>;


export type TransactionOwnersQuery = { __typename?: 'Query', transactions?: { __typename?: 'TransactionConnection', edges?: Array<{ __typename?: 'TransactionEdge', node: { __typename?: 'Transaction', id: string, address: string } } | null> | null } | null };


export const DataAvailabilityTransactionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"DataAvailabilityTransactions"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"owners"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"transactions"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"owners"},"value":{"kind":"Variable","name":{"kind":"Name","value":"owners"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"order"},"value":{"kind":"EnumValue","value":"ASC"}},{"kind":"Argument","name":{"kind":"Name","value":"hasTags"},"value":{"kind":"BooleanValue","value":true}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"address"}}]}},{"kind":"Field","name":{"kind":"Name","value":"cursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"endCursor"}},{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}}]}}]}}]}}]} as unknown as DocumentNode<DataAvailabilityTransactionsQuery, DataAvailabilityTransactionsQueryVariables>;
export const TransactionOwnersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TransactionOwners"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"transactions"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"ids"},"value":{"kind":"ListValue","values":[{"kind":"Variable","name":{"kind":"Name","value":"id"}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"address"}}]}}]}}]}}]}}]} as unknown as DocumentNode<TransactionOwnersQuery, TransactionOwnersQueryVariables>;