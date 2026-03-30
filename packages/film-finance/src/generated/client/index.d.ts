
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Investor
 * 한국 영화 투자자 — VC, 투자조합, 기관, 개인천사, 공공기금
 */
export type Investor = $Result.DefaultSelection<Prisma.$InvestorPayload>
/**
 * Model InvestorGroup
 * 
 */
export type InvestorGroup = $Result.DefaultSelection<Prisma.$InvestorGroupPayload>
/**
 * Model InvestorGroupMember
 * 
 */
export type InvestorGroupMember = $Result.DefaultSelection<Prisma.$InvestorGroupMemberPayload>
/**
 * Model FilmProject
 * 영화 프로젝트 — SPC의 대상이 되는 콘텐츠 IP
 */
export type FilmProject = $Result.DefaultSelection<Prisma.$FilmProjectPayload>
/**
 * Model SPC
 * 한국 영화 PF에 사용되는 특수목적법인
 */
export type SPC = $Result.DefaultSelection<Prisma.$SPCPayload>
/**
 * Model PFTranche
 * PF 트란쉐 — 선순위 대출 / 메자닌 / 지분
 */
export type PFTranche = $Result.DefaultSelection<Prisma.$PFTranchePayload>
/**
 * Model PFTrancheInvestor
 * 
 */
export type PFTrancheInvestor = $Result.DefaultSelection<Prisma.$PFTrancheInvestorPayload>
/**
 * Model WaterfallTier
 * 수익 분배 계층 — 순위별 분배 규칙 정의
 */
export type WaterfallTier = $Result.DefaultSelection<Prisma.$WaterfallTierPayload>
/**
 * Model RevenueEvent
 * 수익 입금 이벤트 — 극장, 스트리밍, 해외판권 등
 */
export type RevenueEvent = $Result.DefaultSelection<Prisma.$RevenueEventPayload>
/**
 * Model WaterfallDistribution
 * 워터폴 분배 계산 결과
 */
export type WaterfallDistribution = $Result.DefaultSelection<Prisma.$WaterfallDistributionPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const InvestorType: {
  VC: 'VC',
  투자조합: '투자조합',
  기관투자자: '기관투자자',
  개인천사투자자: '개인천사투자자',
  공공기금: '공공기금',
  배급사: '배급사'
};

export type InvestorType = (typeof InvestorType)[keyof typeof InvestorType]


export const InvestorTier: {
  A: 'A',
  B: 'B',
  C: 'C',
  D: 'D'
};

export type InvestorTier = (typeof InvestorTier)[keyof typeof InvestorTier]


export const InvestorStatus: {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  PROSPECT: 'PROSPECT'
};

export type InvestorStatus = (typeof InvestorStatus)[keyof typeof InvestorStatus]


export const InvestorGroupType: {
  PEF: 'PEF',
  VCF: 'VCF',
  공공기금: '공공기금',
  개인투자조합: '개인투자조합',
  배급펀드: '배급펀드'
};

export type InvestorGroupType = (typeof InvestorGroupType)[keyof typeof InvestorGroupType]


export const InvestorGroupStatus: {
  ACTIVE: 'ACTIVE',
  CLOSED: 'CLOSED',
  PLANNING: 'PLANNING'
};

export type InvestorGroupStatus = (typeof InvestorGroupStatus)[keyof typeof InvestorGroupStatus]


export const ProjectStatus: {
  DEVELOPMENT: 'DEVELOPMENT',
  PRE_PRODUCTION: 'PRE_PRODUCTION',
  PRODUCTION: 'PRODUCTION',
  POST_PRODUCTION: 'POST_PRODUCTION',
  DISTRIBUTION: 'DISTRIBUTION',
  COMPLETED: 'COMPLETED'
};

export type ProjectStatus = (typeof ProjectStatus)[keyof typeof ProjectStatus]


export const SPCLegalType: {
  주식회사: '주식회사',
  유한회사: '유한회사',
  유한책임회사: '유한책임회사'
};

export type SPCLegalType = (typeof SPCLegalType)[keyof typeof SPCLegalType]


export const SPCStatus: {
  PLANNING: 'PLANNING',
  FORMED: 'FORMED',
  FUNDRAISING: 'FUNDRAISING',
  ACTIVE: 'ACTIVE',
  DISSOLVED: 'DISSOLVED'
};

export type SPCStatus = (typeof SPCStatus)[keyof typeof SPCStatus]


export const TrancheType: {
  senior: 'senior',
  mezzanine: 'mezzanine',
  equity: 'equity'
};

export type TrancheType = (typeof TrancheType)[keyof typeof TrancheType]


export const TrancheStatus: {
  OPEN: 'OPEN',
  CLOSED: 'CLOSED',
  REPAID: 'REPAID'
};

export type TrancheStatus = (typeof TrancheStatus)[keyof typeof TrancheStatus]


export const TierType: {
  loan_repayment: 'loan_repayment',
  preferred_return: 'preferred_return',
  equity_split: 'equity_split',
  expense_recovery: 'expense_recovery',
  revenue_share: 'revenue_share'
};

export type TierType = (typeof TierType)[keyof typeof TierType]


export const RevenueSource: {
  theatrical: 'theatrical',
  streaming: 'streaming',
  overseas: 'overseas',
  broadcast: 'broadcast',
  merchandise: 'merchandise',
  other: 'other'
};

export type RevenueSource = (typeof RevenueSource)[keyof typeof RevenueSource]

}

export type InvestorType = $Enums.InvestorType

export const InvestorType: typeof $Enums.InvestorType

export type InvestorTier = $Enums.InvestorTier

export const InvestorTier: typeof $Enums.InvestorTier

export type InvestorStatus = $Enums.InvestorStatus

export const InvestorStatus: typeof $Enums.InvestorStatus

export type InvestorGroupType = $Enums.InvestorGroupType

export const InvestorGroupType: typeof $Enums.InvestorGroupType

export type InvestorGroupStatus = $Enums.InvestorGroupStatus

export const InvestorGroupStatus: typeof $Enums.InvestorGroupStatus

export type ProjectStatus = $Enums.ProjectStatus

export const ProjectStatus: typeof $Enums.ProjectStatus

export type SPCLegalType = $Enums.SPCLegalType

export const SPCLegalType: typeof $Enums.SPCLegalType

export type SPCStatus = $Enums.SPCStatus

export const SPCStatus: typeof $Enums.SPCStatus

export type TrancheType = $Enums.TrancheType

export const TrancheType: typeof $Enums.TrancheType

export type TrancheStatus = $Enums.TrancheStatus

export const TrancheStatus: typeof $Enums.TrancheStatus

export type TierType = $Enums.TierType

export const TierType: typeof $Enums.TierType

export type RevenueSource = $Enums.RevenueSource

export const RevenueSource: typeof $Enums.RevenueSource

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Investors
 * const investors = await prisma.investor.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Investors
   * const investors = await prisma.investor.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.investor`: Exposes CRUD operations for the **Investor** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Investors
    * const investors = await prisma.investor.findMany()
    * ```
    */
  get investor(): Prisma.InvestorDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.investorGroup`: Exposes CRUD operations for the **InvestorGroup** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more InvestorGroups
    * const investorGroups = await prisma.investorGroup.findMany()
    * ```
    */
  get investorGroup(): Prisma.InvestorGroupDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.investorGroupMember`: Exposes CRUD operations for the **InvestorGroupMember** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more InvestorGroupMembers
    * const investorGroupMembers = await prisma.investorGroupMember.findMany()
    * ```
    */
  get investorGroupMember(): Prisma.InvestorGroupMemberDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.filmProject`: Exposes CRUD operations for the **FilmProject** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more FilmProjects
    * const filmProjects = await prisma.filmProject.findMany()
    * ```
    */
  get filmProject(): Prisma.FilmProjectDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.sPC`: Exposes CRUD operations for the **SPC** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more SPCS
    * const sPCS = await prisma.sPC.findMany()
    * ```
    */
  get sPC(): Prisma.SPCDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.pFTranche`: Exposes CRUD operations for the **PFTranche** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more PFTranches
    * const pFTranches = await prisma.pFTranche.findMany()
    * ```
    */
  get pFTranche(): Prisma.PFTrancheDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.pFTrancheInvestor`: Exposes CRUD operations for the **PFTrancheInvestor** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more PFTrancheInvestors
    * const pFTrancheInvestors = await prisma.pFTrancheInvestor.findMany()
    * ```
    */
  get pFTrancheInvestor(): Prisma.PFTrancheInvestorDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.waterfallTier`: Exposes CRUD operations for the **WaterfallTier** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more WaterfallTiers
    * const waterfallTiers = await prisma.waterfallTier.findMany()
    * ```
    */
  get waterfallTier(): Prisma.WaterfallTierDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.revenueEvent`: Exposes CRUD operations for the **RevenueEvent** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more RevenueEvents
    * const revenueEvents = await prisma.revenueEvent.findMany()
    * ```
    */
  get revenueEvent(): Prisma.RevenueEventDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.waterfallDistribution`: Exposes CRUD operations for the **WaterfallDistribution** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more WaterfallDistributions
    * const waterfallDistributions = await prisma.waterfallDistribution.findMany()
    * ```
    */
  get waterfallDistribution(): Prisma.WaterfallDistributionDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.19.2
   * Query Engine version: c2990dca591cba766e3b7ef5d9e8a84796e47ab7
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Investor: 'Investor',
    InvestorGroup: 'InvestorGroup',
    InvestorGroupMember: 'InvestorGroupMember',
    FilmProject: 'FilmProject',
    SPC: 'SPC',
    PFTranche: 'PFTranche',
    PFTrancheInvestor: 'PFTrancheInvestor',
    WaterfallTier: 'WaterfallTier',
    RevenueEvent: 'RevenueEvent',
    WaterfallDistribution: 'WaterfallDistribution'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "investor" | "investorGroup" | "investorGroupMember" | "filmProject" | "sPC" | "pFTranche" | "pFTrancheInvestor" | "waterfallTier" | "revenueEvent" | "waterfallDistribution"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Investor: {
        payload: Prisma.$InvestorPayload<ExtArgs>
        fields: Prisma.InvestorFieldRefs
        operations: {
          findUnique: {
            args: Prisma.InvestorFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InvestorPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.InvestorFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InvestorPayload>
          }
          findFirst: {
            args: Prisma.InvestorFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InvestorPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.InvestorFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InvestorPayload>
          }
          findMany: {
            args: Prisma.InvestorFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InvestorPayload>[]
          }
          create: {
            args: Prisma.InvestorCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InvestorPayload>
          }
          createMany: {
            args: Prisma.InvestorCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.InvestorCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InvestorPayload>[]
          }
          delete: {
            args: Prisma.InvestorDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InvestorPayload>
          }
          update: {
            args: Prisma.InvestorUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InvestorPayload>
          }
          deleteMany: {
            args: Prisma.InvestorDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.InvestorUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.InvestorUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InvestorPayload>[]
          }
          upsert: {
            args: Prisma.InvestorUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InvestorPayload>
          }
          aggregate: {
            args: Prisma.InvestorAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateInvestor>
          }
          groupBy: {
            args: Prisma.InvestorGroupByArgs<ExtArgs>
            result: $Utils.Optional<InvestorGroupByOutputType>[]
          }
          count: {
            args: Prisma.InvestorCountArgs<ExtArgs>
            result: $Utils.Optional<InvestorCountAggregateOutputType> | number
          }
        }
      }
      InvestorGroup: {
        payload: Prisma.$InvestorGroupPayload<ExtArgs>
        fields: Prisma.InvestorGroupFieldRefs
        operations: {
          findUnique: {
            args: Prisma.InvestorGroupFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InvestorGroupPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.InvestorGroupFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InvestorGroupPayload>
          }
          findFirst: {
            args: Prisma.InvestorGroupFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InvestorGroupPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.InvestorGroupFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InvestorGroupPayload>
          }
          findMany: {
            args: Prisma.InvestorGroupFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InvestorGroupPayload>[]
          }
          create: {
            args: Prisma.InvestorGroupCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InvestorGroupPayload>
          }
          createMany: {
            args: Prisma.InvestorGroupCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.InvestorGroupCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InvestorGroupPayload>[]
          }
          delete: {
            args: Prisma.InvestorGroupDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InvestorGroupPayload>
          }
          update: {
            args: Prisma.InvestorGroupUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InvestorGroupPayload>
          }
          deleteMany: {
            args: Prisma.InvestorGroupDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.InvestorGroupUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.InvestorGroupUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InvestorGroupPayload>[]
          }
          upsert: {
            args: Prisma.InvestorGroupUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InvestorGroupPayload>
          }
          aggregate: {
            args: Prisma.InvestorGroupAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateInvestorGroup>
          }
          groupBy: {
            args: Prisma.InvestorGroupGroupByArgs<ExtArgs>
            result: $Utils.Optional<InvestorGroupGroupByOutputType>[]
          }
          count: {
            args: Prisma.InvestorGroupCountArgs<ExtArgs>
            result: $Utils.Optional<InvestorGroupCountAggregateOutputType> | number
          }
        }
      }
      InvestorGroupMember: {
        payload: Prisma.$InvestorGroupMemberPayload<ExtArgs>
        fields: Prisma.InvestorGroupMemberFieldRefs
        operations: {
          findUnique: {
            args: Prisma.InvestorGroupMemberFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InvestorGroupMemberPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.InvestorGroupMemberFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InvestorGroupMemberPayload>
          }
          findFirst: {
            args: Prisma.InvestorGroupMemberFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InvestorGroupMemberPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.InvestorGroupMemberFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InvestorGroupMemberPayload>
          }
          findMany: {
            args: Prisma.InvestorGroupMemberFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InvestorGroupMemberPayload>[]
          }
          create: {
            args: Prisma.InvestorGroupMemberCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InvestorGroupMemberPayload>
          }
          createMany: {
            args: Prisma.InvestorGroupMemberCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.InvestorGroupMemberCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InvestorGroupMemberPayload>[]
          }
          delete: {
            args: Prisma.InvestorGroupMemberDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InvestorGroupMemberPayload>
          }
          update: {
            args: Prisma.InvestorGroupMemberUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InvestorGroupMemberPayload>
          }
          deleteMany: {
            args: Prisma.InvestorGroupMemberDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.InvestorGroupMemberUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.InvestorGroupMemberUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InvestorGroupMemberPayload>[]
          }
          upsert: {
            args: Prisma.InvestorGroupMemberUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InvestorGroupMemberPayload>
          }
          aggregate: {
            args: Prisma.InvestorGroupMemberAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateInvestorGroupMember>
          }
          groupBy: {
            args: Prisma.InvestorGroupMemberGroupByArgs<ExtArgs>
            result: $Utils.Optional<InvestorGroupMemberGroupByOutputType>[]
          }
          count: {
            args: Prisma.InvestorGroupMemberCountArgs<ExtArgs>
            result: $Utils.Optional<InvestorGroupMemberCountAggregateOutputType> | number
          }
        }
      }
      FilmProject: {
        payload: Prisma.$FilmProjectPayload<ExtArgs>
        fields: Prisma.FilmProjectFieldRefs
        operations: {
          findUnique: {
            args: Prisma.FilmProjectFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FilmProjectPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.FilmProjectFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FilmProjectPayload>
          }
          findFirst: {
            args: Prisma.FilmProjectFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FilmProjectPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.FilmProjectFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FilmProjectPayload>
          }
          findMany: {
            args: Prisma.FilmProjectFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FilmProjectPayload>[]
          }
          create: {
            args: Prisma.FilmProjectCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FilmProjectPayload>
          }
          createMany: {
            args: Prisma.FilmProjectCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.FilmProjectCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FilmProjectPayload>[]
          }
          delete: {
            args: Prisma.FilmProjectDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FilmProjectPayload>
          }
          update: {
            args: Prisma.FilmProjectUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FilmProjectPayload>
          }
          deleteMany: {
            args: Prisma.FilmProjectDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.FilmProjectUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.FilmProjectUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FilmProjectPayload>[]
          }
          upsert: {
            args: Prisma.FilmProjectUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FilmProjectPayload>
          }
          aggregate: {
            args: Prisma.FilmProjectAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateFilmProject>
          }
          groupBy: {
            args: Prisma.FilmProjectGroupByArgs<ExtArgs>
            result: $Utils.Optional<FilmProjectGroupByOutputType>[]
          }
          count: {
            args: Prisma.FilmProjectCountArgs<ExtArgs>
            result: $Utils.Optional<FilmProjectCountAggregateOutputType> | number
          }
        }
      }
      SPC: {
        payload: Prisma.$SPCPayload<ExtArgs>
        fields: Prisma.SPCFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SPCFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SPCPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SPCFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SPCPayload>
          }
          findFirst: {
            args: Prisma.SPCFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SPCPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SPCFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SPCPayload>
          }
          findMany: {
            args: Prisma.SPCFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SPCPayload>[]
          }
          create: {
            args: Prisma.SPCCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SPCPayload>
          }
          createMany: {
            args: Prisma.SPCCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SPCCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SPCPayload>[]
          }
          delete: {
            args: Prisma.SPCDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SPCPayload>
          }
          update: {
            args: Prisma.SPCUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SPCPayload>
          }
          deleteMany: {
            args: Prisma.SPCDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SPCUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.SPCUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SPCPayload>[]
          }
          upsert: {
            args: Prisma.SPCUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SPCPayload>
          }
          aggregate: {
            args: Prisma.SPCAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSPC>
          }
          groupBy: {
            args: Prisma.SPCGroupByArgs<ExtArgs>
            result: $Utils.Optional<SPCGroupByOutputType>[]
          }
          count: {
            args: Prisma.SPCCountArgs<ExtArgs>
            result: $Utils.Optional<SPCCountAggregateOutputType> | number
          }
        }
      }
      PFTranche: {
        payload: Prisma.$PFTranchePayload<ExtArgs>
        fields: Prisma.PFTrancheFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PFTrancheFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PFTranchePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PFTrancheFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PFTranchePayload>
          }
          findFirst: {
            args: Prisma.PFTrancheFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PFTranchePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PFTrancheFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PFTranchePayload>
          }
          findMany: {
            args: Prisma.PFTrancheFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PFTranchePayload>[]
          }
          create: {
            args: Prisma.PFTrancheCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PFTranchePayload>
          }
          createMany: {
            args: Prisma.PFTrancheCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PFTrancheCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PFTranchePayload>[]
          }
          delete: {
            args: Prisma.PFTrancheDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PFTranchePayload>
          }
          update: {
            args: Prisma.PFTrancheUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PFTranchePayload>
          }
          deleteMany: {
            args: Prisma.PFTrancheDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PFTrancheUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.PFTrancheUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PFTranchePayload>[]
          }
          upsert: {
            args: Prisma.PFTrancheUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PFTranchePayload>
          }
          aggregate: {
            args: Prisma.PFTrancheAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePFTranche>
          }
          groupBy: {
            args: Prisma.PFTrancheGroupByArgs<ExtArgs>
            result: $Utils.Optional<PFTrancheGroupByOutputType>[]
          }
          count: {
            args: Prisma.PFTrancheCountArgs<ExtArgs>
            result: $Utils.Optional<PFTrancheCountAggregateOutputType> | number
          }
        }
      }
      PFTrancheInvestor: {
        payload: Prisma.$PFTrancheInvestorPayload<ExtArgs>
        fields: Prisma.PFTrancheInvestorFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PFTrancheInvestorFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PFTrancheInvestorPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PFTrancheInvestorFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PFTrancheInvestorPayload>
          }
          findFirst: {
            args: Prisma.PFTrancheInvestorFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PFTrancheInvestorPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PFTrancheInvestorFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PFTrancheInvestorPayload>
          }
          findMany: {
            args: Prisma.PFTrancheInvestorFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PFTrancheInvestorPayload>[]
          }
          create: {
            args: Prisma.PFTrancheInvestorCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PFTrancheInvestorPayload>
          }
          createMany: {
            args: Prisma.PFTrancheInvestorCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PFTrancheInvestorCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PFTrancheInvestorPayload>[]
          }
          delete: {
            args: Prisma.PFTrancheInvestorDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PFTrancheInvestorPayload>
          }
          update: {
            args: Prisma.PFTrancheInvestorUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PFTrancheInvestorPayload>
          }
          deleteMany: {
            args: Prisma.PFTrancheInvestorDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PFTrancheInvestorUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.PFTrancheInvestorUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PFTrancheInvestorPayload>[]
          }
          upsert: {
            args: Prisma.PFTrancheInvestorUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PFTrancheInvestorPayload>
          }
          aggregate: {
            args: Prisma.PFTrancheInvestorAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePFTrancheInvestor>
          }
          groupBy: {
            args: Prisma.PFTrancheInvestorGroupByArgs<ExtArgs>
            result: $Utils.Optional<PFTrancheInvestorGroupByOutputType>[]
          }
          count: {
            args: Prisma.PFTrancheInvestorCountArgs<ExtArgs>
            result: $Utils.Optional<PFTrancheInvestorCountAggregateOutputType> | number
          }
        }
      }
      WaterfallTier: {
        payload: Prisma.$WaterfallTierPayload<ExtArgs>
        fields: Prisma.WaterfallTierFieldRefs
        operations: {
          findUnique: {
            args: Prisma.WaterfallTierFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WaterfallTierPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.WaterfallTierFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WaterfallTierPayload>
          }
          findFirst: {
            args: Prisma.WaterfallTierFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WaterfallTierPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.WaterfallTierFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WaterfallTierPayload>
          }
          findMany: {
            args: Prisma.WaterfallTierFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WaterfallTierPayload>[]
          }
          create: {
            args: Prisma.WaterfallTierCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WaterfallTierPayload>
          }
          createMany: {
            args: Prisma.WaterfallTierCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.WaterfallTierCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WaterfallTierPayload>[]
          }
          delete: {
            args: Prisma.WaterfallTierDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WaterfallTierPayload>
          }
          update: {
            args: Prisma.WaterfallTierUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WaterfallTierPayload>
          }
          deleteMany: {
            args: Prisma.WaterfallTierDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.WaterfallTierUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.WaterfallTierUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WaterfallTierPayload>[]
          }
          upsert: {
            args: Prisma.WaterfallTierUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WaterfallTierPayload>
          }
          aggregate: {
            args: Prisma.WaterfallTierAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateWaterfallTier>
          }
          groupBy: {
            args: Prisma.WaterfallTierGroupByArgs<ExtArgs>
            result: $Utils.Optional<WaterfallTierGroupByOutputType>[]
          }
          count: {
            args: Prisma.WaterfallTierCountArgs<ExtArgs>
            result: $Utils.Optional<WaterfallTierCountAggregateOutputType> | number
          }
        }
      }
      RevenueEvent: {
        payload: Prisma.$RevenueEventPayload<ExtArgs>
        fields: Prisma.RevenueEventFieldRefs
        operations: {
          findUnique: {
            args: Prisma.RevenueEventFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RevenueEventPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.RevenueEventFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RevenueEventPayload>
          }
          findFirst: {
            args: Prisma.RevenueEventFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RevenueEventPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.RevenueEventFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RevenueEventPayload>
          }
          findMany: {
            args: Prisma.RevenueEventFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RevenueEventPayload>[]
          }
          create: {
            args: Prisma.RevenueEventCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RevenueEventPayload>
          }
          createMany: {
            args: Prisma.RevenueEventCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.RevenueEventCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RevenueEventPayload>[]
          }
          delete: {
            args: Prisma.RevenueEventDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RevenueEventPayload>
          }
          update: {
            args: Prisma.RevenueEventUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RevenueEventPayload>
          }
          deleteMany: {
            args: Prisma.RevenueEventDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.RevenueEventUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.RevenueEventUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RevenueEventPayload>[]
          }
          upsert: {
            args: Prisma.RevenueEventUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RevenueEventPayload>
          }
          aggregate: {
            args: Prisma.RevenueEventAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateRevenueEvent>
          }
          groupBy: {
            args: Prisma.RevenueEventGroupByArgs<ExtArgs>
            result: $Utils.Optional<RevenueEventGroupByOutputType>[]
          }
          count: {
            args: Prisma.RevenueEventCountArgs<ExtArgs>
            result: $Utils.Optional<RevenueEventCountAggregateOutputType> | number
          }
        }
      }
      WaterfallDistribution: {
        payload: Prisma.$WaterfallDistributionPayload<ExtArgs>
        fields: Prisma.WaterfallDistributionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.WaterfallDistributionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WaterfallDistributionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.WaterfallDistributionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WaterfallDistributionPayload>
          }
          findFirst: {
            args: Prisma.WaterfallDistributionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WaterfallDistributionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.WaterfallDistributionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WaterfallDistributionPayload>
          }
          findMany: {
            args: Prisma.WaterfallDistributionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WaterfallDistributionPayload>[]
          }
          create: {
            args: Prisma.WaterfallDistributionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WaterfallDistributionPayload>
          }
          createMany: {
            args: Prisma.WaterfallDistributionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.WaterfallDistributionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WaterfallDistributionPayload>[]
          }
          delete: {
            args: Prisma.WaterfallDistributionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WaterfallDistributionPayload>
          }
          update: {
            args: Prisma.WaterfallDistributionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WaterfallDistributionPayload>
          }
          deleteMany: {
            args: Prisma.WaterfallDistributionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.WaterfallDistributionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.WaterfallDistributionUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WaterfallDistributionPayload>[]
          }
          upsert: {
            args: Prisma.WaterfallDistributionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WaterfallDistributionPayload>
          }
          aggregate: {
            args: Prisma.WaterfallDistributionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateWaterfallDistribution>
          }
          groupBy: {
            args: Prisma.WaterfallDistributionGroupByArgs<ExtArgs>
            result: $Utils.Optional<WaterfallDistributionGroupByOutputType>[]
          }
          count: {
            args: Prisma.WaterfallDistributionCountArgs<ExtArgs>
            result: $Utils.Optional<WaterfallDistributionCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory | null
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    investor?: InvestorOmit
    investorGroup?: InvestorGroupOmit
    investorGroupMember?: InvestorGroupMemberOmit
    filmProject?: FilmProjectOmit
    sPC?: SPCOmit
    pFTranche?: PFTrancheOmit
    pFTrancheInvestor?: PFTrancheInvestorOmit
    waterfallTier?: WaterfallTierOmit
    revenueEvent?: RevenueEventOmit
    waterfallDistribution?: WaterfallDistributionOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type InvestorCountOutputType
   */

  export type InvestorCountOutputType = {
    groupMemberships: number
    tranchePositions: number
  }

  export type InvestorCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    groupMemberships?: boolean | InvestorCountOutputTypeCountGroupMembershipsArgs
    tranchePositions?: boolean | InvestorCountOutputTypeCountTranchePositionsArgs
  }

  // Custom InputTypes
  /**
   * InvestorCountOutputType without action
   */
  export type InvestorCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InvestorCountOutputType
     */
    select?: InvestorCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * InvestorCountOutputType without action
   */
  export type InvestorCountOutputTypeCountGroupMembershipsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: InvestorGroupMemberWhereInput
  }

  /**
   * InvestorCountOutputType without action
   */
  export type InvestorCountOutputTypeCountTranchePositionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PFTrancheInvestorWhereInput
  }


  /**
   * Count Type InvestorGroupCountOutputType
   */

  export type InvestorGroupCountOutputType = {
    members: number
  }

  export type InvestorGroupCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    members?: boolean | InvestorGroupCountOutputTypeCountMembersArgs
  }

  // Custom InputTypes
  /**
   * InvestorGroupCountOutputType without action
   */
  export type InvestorGroupCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InvestorGroupCountOutputType
     */
    select?: InvestorGroupCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * InvestorGroupCountOutputType without action
   */
  export type InvestorGroupCountOutputTypeCountMembersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: InvestorGroupMemberWhereInput
  }


  /**
   * Count Type FilmProjectCountOutputType
   */

  export type FilmProjectCountOutputType = {
    spcs: number
  }

  export type FilmProjectCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    spcs?: boolean | FilmProjectCountOutputTypeCountSpcsArgs
  }

  // Custom InputTypes
  /**
   * FilmProjectCountOutputType without action
   */
  export type FilmProjectCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FilmProjectCountOutputType
     */
    select?: FilmProjectCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * FilmProjectCountOutputType without action
   */
  export type FilmProjectCountOutputTypeCountSpcsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SPCWhereInput
  }


  /**
   * Count Type SPCCountOutputType
   */

  export type SPCCountOutputType = {
    tranches: number
    waterfallTiers: number
    revenueEvents: number
  }

  export type SPCCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tranches?: boolean | SPCCountOutputTypeCountTranchesArgs
    waterfallTiers?: boolean | SPCCountOutputTypeCountWaterfallTiersArgs
    revenueEvents?: boolean | SPCCountOutputTypeCountRevenueEventsArgs
  }

  // Custom InputTypes
  /**
   * SPCCountOutputType without action
   */
  export type SPCCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SPCCountOutputType
     */
    select?: SPCCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * SPCCountOutputType without action
   */
  export type SPCCountOutputTypeCountTranchesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PFTrancheWhereInput
  }

  /**
   * SPCCountOutputType without action
   */
  export type SPCCountOutputTypeCountWaterfallTiersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: WaterfallTierWhereInput
  }

  /**
   * SPCCountOutputType without action
   */
  export type SPCCountOutputTypeCountRevenueEventsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RevenueEventWhereInput
  }


  /**
   * Count Type PFTrancheCountOutputType
   */

  export type PFTrancheCountOutputType = {
    investors: number
    waterfallTiers: number
  }

  export type PFTrancheCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    investors?: boolean | PFTrancheCountOutputTypeCountInvestorsArgs
    waterfallTiers?: boolean | PFTrancheCountOutputTypeCountWaterfallTiersArgs
  }

  // Custom InputTypes
  /**
   * PFTrancheCountOutputType without action
   */
  export type PFTrancheCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PFTrancheCountOutputType
     */
    select?: PFTrancheCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * PFTrancheCountOutputType without action
   */
  export type PFTrancheCountOutputTypeCountInvestorsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PFTrancheInvestorWhereInput
  }

  /**
   * PFTrancheCountOutputType without action
   */
  export type PFTrancheCountOutputTypeCountWaterfallTiersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: WaterfallTierWhereInput
  }


  /**
   * Count Type RevenueEventCountOutputType
   */

  export type RevenueEventCountOutputType = {
    distributions: number
  }

  export type RevenueEventCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    distributions?: boolean | RevenueEventCountOutputTypeCountDistributionsArgs
  }

  // Custom InputTypes
  /**
   * RevenueEventCountOutputType without action
   */
  export type RevenueEventCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RevenueEventCountOutputType
     */
    select?: RevenueEventCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * RevenueEventCountOutputType without action
   */
  export type RevenueEventCountOutputTypeCountDistributionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: WaterfallDistributionWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Investor
   */

  export type AggregateInvestor = {
    _count: InvestorCountAggregateOutputType | null
    _avg: InvestorAvgAggregateOutputType | null
    _sum: InvestorSumAggregateOutputType | null
    _min: InvestorMinAggregateOutputType | null
    _max: InvestorMaxAggregateOutputType | null
  }

  export type InvestorAvgAggregateOutputType = {
    investmentCapacity: number | null
    minTicket: number | null
    maxTicket: number | null
  }

  export type InvestorSumAggregateOutputType = {
    investmentCapacity: number | null
    minTicket: number | null
    maxTicket: number | null
  }

  export type InvestorMinAggregateOutputType = {
    id: string | null
    name: string | null
    nameEn: string | null
    type: $Enums.InvestorType | null
    tier: $Enums.InvestorTier | null
    status: $Enums.InvestorStatus | null
    country: string | null
    region: string | null
    contactName: string | null
    contactEmail: string | null
    contactPhone: string | null
    investmentCapacity: number | null
    minTicket: number | null
    maxTicket: number | null
    preferredGenres: string | null
    preferredBudgetRange: string | null
    pastInvestments: string | null
    notes: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type InvestorMaxAggregateOutputType = {
    id: string | null
    name: string | null
    nameEn: string | null
    type: $Enums.InvestorType | null
    tier: $Enums.InvestorTier | null
    status: $Enums.InvestorStatus | null
    country: string | null
    region: string | null
    contactName: string | null
    contactEmail: string | null
    contactPhone: string | null
    investmentCapacity: number | null
    minTicket: number | null
    maxTicket: number | null
    preferredGenres: string | null
    preferredBudgetRange: string | null
    pastInvestments: string | null
    notes: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type InvestorCountAggregateOutputType = {
    id: number
    name: number
    nameEn: number
    type: number
    tier: number
    status: number
    country: number
    region: number
    contactName: number
    contactEmail: number
    contactPhone: number
    investmentCapacity: number
    minTicket: number
    maxTicket: number
    preferredGenres: number
    preferredBudgetRange: number
    pastInvestments: number
    notes: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type InvestorAvgAggregateInputType = {
    investmentCapacity?: true
    minTicket?: true
    maxTicket?: true
  }

  export type InvestorSumAggregateInputType = {
    investmentCapacity?: true
    minTicket?: true
    maxTicket?: true
  }

  export type InvestorMinAggregateInputType = {
    id?: true
    name?: true
    nameEn?: true
    type?: true
    tier?: true
    status?: true
    country?: true
    region?: true
    contactName?: true
    contactEmail?: true
    contactPhone?: true
    investmentCapacity?: true
    minTicket?: true
    maxTicket?: true
    preferredGenres?: true
    preferredBudgetRange?: true
    pastInvestments?: true
    notes?: true
    createdAt?: true
    updatedAt?: true
  }

  export type InvestorMaxAggregateInputType = {
    id?: true
    name?: true
    nameEn?: true
    type?: true
    tier?: true
    status?: true
    country?: true
    region?: true
    contactName?: true
    contactEmail?: true
    contactPhone?: true
    investmentCapacity?: true
    minTicket?: true
    maxTicket?: true
    preferredGenres?: true
    preferredBudgetRange?: true
    pastInvestments?: true
    notes?: true
    createdAt?: true
    updatedAt?: true
  }

  export type InvestorCountAggregateInputType = {
    id?: true
    name?: true
    nameEn?: true
    type?: true
    tier?: true
    status?: true
    country?: true
    region?: true
    contactName?: true
    contactEmail?: true
    contactPhone?: true
    investmentCapacity?: true
    minTicket?: true
    maxTicket?: true
    preferredGenres?: true
    preferredBudgetRange?: true
    pastInvestments?: true
    notes?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type InvestorAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Investor to aggregate.
     */
    where?: InvestorWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Investors to fetch.
     */
    orderBy?: InvestorOrderByWithRelationInput | InvestorOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: InvestorWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Investors from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Investors.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Investors
    **/
    _count?: true | InvestorCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: InvestorAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: InvestorSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: InvestorMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: InvestorMaxAggregateInputType
  }

  export type GetInvestorAggregateType<T extends InvestorAggregateArgs> = {
        [P in keyof T & keyof AggregateInvestor]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateInvestor[P]>
      : GetScalarType<T[P], AggregateInvestor[P]>
  }




  export type InvestorGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: InvestorWhereInput
    orderBy?: InvestorOrderByWithAggregationInput | InvestorOrderByWithAggregationInput[]
    by: InvestorScalarFieldEnum[] | InvestorScalarFieldEnum
    having?: InvestorScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: InvestorCountAggregateInputType | true
    _avg?: InvestorAvgAggregateInputType
    _sum?: InvestorSumAggregateInputType
    _min?: InvestorMinAggregateInputType
    _max?: InvestorMaxAggregateInputType
  }

  export type InvestorGroupByOutputType = {
    id: string
    name: string
    nameEn: string | null
    type: $Enums.InvestorType
    tier: $Enums.InvestorTier
    status: $Enums.InvestorStatus
    country: string
    region: string | null
    contactName: string | null
    contactEmail: string | null
    contactPhone: string | null
    investmentCapacity: number | null
    minTicket: number | null
    maxTicket: number | null
    preferredGenres: string
    preferredBudgetRange: string
    pastInvestments: string
    notes: string | null
    createdAt: Date
    updatedAt: Date
    _count: InvestorCountAggregateOutputType | null
    _avg: InvestorAvgAggregateOutputType | null
    _sum: InvestorSumAggregateOutputType | null
    _min: InvestorMinAggregateOutputType | null
    _max: InvestorMaxAggregateOutputType | null
  }

  type GetInvestorGroupByPayload<T extends InvestorGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<InvestorGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof InvestorGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], InvestorGroupByOutputType[P]>
            : GetScalarType<T[P], InvestorGroupByOutputType[P]>
        }
      >
    >


  export type InvestorSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    nameEn?: boolean
    type?: boolean
    tier?: boolean
    status?: boolean
    country?: boolean
    region?: boolean
    contactName?: boolean
    contactEmail?: boolean
    contactPhone?: boolean
    investmentCapacity?: boolean
    minTicket?: boolean
    maxTicket?: boolean
    preferredGenres?: boolean
    preferredBudgetRange?: boolean
    pastInvestments?: boolean
    notes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    groupMemberships?: boolean | Investor$groupMembershipsArgs<ExtArgs>
    tranchePositions?: boolean | Investor$tranchePositionsArgs<ExtArgs>
    _count?: boolean | InvestorCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["investor"]>

  export type InvestorSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    nameEn?: boolean
    type?: boolean
    tier?: boolean
    status?: boolean
    country?: boolean
    region?: boolean
    contactName?: boolean
    contactEmail?: boolean
    contactPhone?: boolean
    investmentCapacity?: boolean
    minTicket?: boolean
    maxTicket?: boolean
    preferredGenres?: boolean
    preferredBudgetRange?: boolean
    pastInvestments?: boolean
    notes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["investor"]>

  export type InvestorSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    nameEn?: boolean
    type?: boolean
    tier?: boolean
    status?: boolean
    country?: boolean
    region?: boolean
    contactName?: boolean
    contactEmail?: boolean
    contactPhone?: boolean
    investmentCapacity?: boolean
    minTicket?: boolean
    maxTicket?: boolean
    preferredGenres?: boolean
    preferredBudgetRange?: boolean
    pastInvestments?: boolean
    notes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["investor"]>

  export type InvestorSelectScalar = {
    id?: boolean
    name?: boolean
    nameEn?: boolean
    type?: boolean
    tier?: boolean
    status?: boolean
    country?: boolean
    region?: boolean
    contactName?: boolean
    contactEmail?: boolean
    contactPhone?: boolean
    investmentCapacity?: boolean
    minTicket?: boolean
    maxTicket?: boolean
    preferredGenres?: boolean
    preferredBudgetRange?: boolean
    pastInvestments?: boolean
    notes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type InvestorOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "nameEn" | "type" | "tier" | "status" | "country" | "region" | "contactName" | "contactEmail" | "contactPhone" | "investmentCapacity" | "minTicket" | "maxTicket" | "preferredGenres" | "preferredBudgetRange" | "pastInvestments" | "notes" | "createdAt" | "updatedAt", ExtArgs["result"]["investor"]>
  export type InvestorInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    groupMemberships?: boolean | Investor$groupMembershipsArgs<ExtArgs>
    tranchePositions?: boolean | Investor$tranchePositionsArgs<ExtArgs>
    _count?: boolean | InvestorCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type InvestorIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type InvestorIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $InvestorPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Investor"
    objects: {
      groupMemberships: Prisma.$InvestorGroupMemberPayload<ExtArgs>[]
      tranchePositions: Prisma.$PFTrancheInvestorPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      nameEn: string | null
      /**
       * VC | 투자조합 | 기관투자자 | 개인천사투자자 | 공공기금 | 배급사
       */
      type: $Enums.InvestorType
      /**
       * A(대형 10억+) | B(중형 1-10억) | C(소형 1억 미만) | D(잠재)
       */
      tier: $Enums.InvestorTier
      status: $Enums.InvestorStatus
      country: string
      region: string | null
      contactName: string | null
      contactEmail: string | null
      contactPhone: string | null
      /**
       * 총 투자 가능 규모 (단위: 만원)
       */
      investmentCapacity: number | null
      /**
       * 건당 최소 투자액 (만원)
       */
      minTicket: number | null
      /**
       * 건당 최대 투자액 (만원)
       */
      maxTicket: number | null
      /**
       * ["액션", "드라마", "SF", ...] — JSON 배열
       */
      preferredGenres: string
      /**
       * { "min": 5000, "max": 50000 } 만원 단위 — JSON
       */
      preferredBudgetRange: string
      /**
       * 과거 투자 이력 — [{ title, year, amount, role }] JSON 배열
       */
      pastInvestments: string
      notes: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["investor"]>
    composites: {}
  }

  type InvestorGetPayload<S extends boolean | null | undefined | InvestorDefaultArgs> = $Result.GetResult<Prisma.$InvestorPayload, S>

  type InvestorCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<InvestorFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: InvestorCountAggregateInputType | true
    }

  export interface InvestorDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Investor'], meta: { name: 'Investor' } }
    /**
     * Find zero or one Investor that matches the filter.
     * @param {InvestorFindUniqueArgs} args - Arguments to find a Investor
     * @example
     * // Get one Investor
     * const investor = await prisma.investor.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends InvestorFindUniqueArgs>(args: SelectSubset<T, InvestorFindUniqueArgs<ExtArgs>>): Prisma__InvestorClient<$Result.GetResult<Prisma.$InvestorPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Investor that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {InvestorFindUniqueOrThrowArgs} args - Arguments to find a Investor
     * @example
     * // Get one Investor
     * const investor = await prisma.investor.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends InvestorFindUniqueOrThrowArgs>(args: SelectSubset<T, InvestorFindUniqueOrThrowArgs<ExtArgs>>): Prisma__InvestorClient<$Result.GetResult<Prisma.$InvestorPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Investor that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InvestorFindFirstArgs} args - Arguments to find a Investor
     * @example
     * // Get one Investor
     * const investor = await prisma.investor.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends InvestorFindFirstArgs>(args?: SelectSubset<T, InvestorFindFirstArgs<ExtArgs>>): Prisma__InvestorClient<$Result.GetResult<Prisma.$InvestorPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Investor that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InvestorFindFirstOrThrowArgs} args - Arguments to find a Investor
     * @example
     * // Get one Investor
     * const investor = await prisma.investor.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends InvestorFindFirstOrThrowArgs>(args?: SelectSubset<T, InvestorFindFirstOrThrowArgs<ExtArgs>>): Prisma__InvestorClient<$Result.GetResult<Prisma.$InvestorPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Investors that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InvestorFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Investors
     * const investors = await prisma.investor.findMany()
     * 
     * // Get first 10 Investors
     * const investors = await prisma.investor.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const investorWithIdOnly = await prisma.investor.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends InvestorFindManyArgs>(args?: SelectSubset<T, InvestorFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InvestorPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Investor.
     * @param {InvestorCreateArgs} args - Arguments to create a Investor.
     * @example
     * // Create one Investor
     * const Investor = await prisma.investor.create({
     *   data: {
     *     // ... data to create a Investor
     *   }
     * })
     * 
     */
    create<T extends InvestorCreateArgs>(args: SelectSubset<T, InvestorCreateArgs<ExtArgs>>): Prisma__InvestorClient<$Result.GetResult<Prisma.$InvestorPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Investors.
     * @param {InvestorCreateManyArgs} args - Arguments to create many Investors.
     * @example
     * // Create many Investors
     * const investor = await prisma.investor.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends InvestorCreateManyArgs>(args?: SelectSubset<T, InvestorCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Investors and returns the data saved in the database.
     * @param {InvestorCreateManyAndReturnArgs} args - Arguments to create many Investors.
     * @example
     * // Create many Investors
     * const investor = await prisma.investor.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Investors and only return the `id`
     * const investorWithIdOnly = await prisma.investor.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends InvestorCreateManyAndReturnArgs>(args?: SelectSubset<T, InvestorCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InvestorPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Investor.
     * @param {InvestorDeleteArgs} args - Arguments to delete one Investor.
     * @example
     * // Delete one Investor
     * const Investor = await prisma.investor.delete({
     *   where: {
     *     // ... filter to delete one Investor
     *   }
     * })
     * 
     */
    delete<T extends InvestorDeleteArgs>(args: SelectSubset<T, InvestorDeleteArgs<ExtArgs>>): Prisma__InvestorClient<$Result.GetResult<Prisma.$InvestorPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Investor.
     * @param {InvestorUpdateArgs} args - Arguments to update one Investor.
     * @example
     * // Update one Investor
     * const investor = await prisma.investor.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends InvestorUpdateArgs>(args: SelectSubset<T, InvestorUpdateArgs<ExtArgs>>): Prisma__InvestorClient<$Result.GetResult<Prisma.$InvestorPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Investors.
     * @param {InvestorDeleteManyArgs} args - Arguments to filter Investors to delete.
     * @example
     * // Delete a few Investors
     * const { count } = await prisma.investor.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends InvestorDeleteManyArgs>(args?: SelectSubset<T, InvestorDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Investors.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InvestorUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Investors
     * const investor = await prisma.investor.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends InvestorUpdateManyArgs>(args: SelectSubset<T, InvestorUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Investors and returns the data updated in the database.
     * @param {InvestorUpdateManyAndReturnArgs} args - Arguments to update many Investors.
     * @example
     * // Update many Investors
     * const investor = await prisma.investor.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Investors and only return the `id`
     * const investorWithIdOnly = await prisma.investor.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends InvestorUpdateManyAndReturnArgs>(args: SelectSubset<T, InvestorUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InvestorPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Investor.
     * @param {InvestorUpsertArgs} args - Arguments to update or create a Investor.
     * @example
     * // Update or create a Investor
     * const investor = await prisma.investor.upsert({
     *   create: {
     *     // ... data to create a Investor
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Investor we want to update
     *   }
     * })
     */
    upsert<T extends InvestorUpsertArgs>(args: SelectSubset<T, InvestorUpsertArgs<ExtArgs>>): Prisma__InvestorClient<$Result.GetResult<Prisma.$InvestorPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Investors.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InvestorCountArgs} args - Arguments to filter Investors to count.
     * @example
     * // Count the number of Investors
     * const count = await prisma.investor.count({
     *   where: {
     *     // ... the filter for the Investors we want to count
     *   }
     * })
    **/
    count<T extends InvestorCountArgs>(
      args?: Subset<T, InvestorCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], InvestorCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Investor.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InvestorAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends InvestorAggregateArgs>(args: Subset<T, InvestorAggregateArgs>): Prisma.PrismaPromise<GetInvestorAggregateType<T>>

    /**
     * Group by Investor.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InvestorGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends InvestorGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: InvestorGroupByArgs['orderBy'] }
        : { orderBy?: InvestorGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, InvestorGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetInvestorGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Investor model
   */
  readonly fields: InvestorFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Investor.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__InvestorClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    groupMemberships<T extends Investor$groupMembershipsArgs<ExtArgs> = {}>(args?: Subset<T, Investor$groupMembershipsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InvestorGroupMemberPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    tranchePositions<T extends Investor$tranchePositionsArgs<ExtArgs> = {}>(args?: Subset<T, Investor$tranchePositionsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PFTrancheInvestorPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Investor model
   */
  interface InvestorFieldRefs {
    readonly id: FieldRef<"Investor", 'String'>
    readonly name: FieldRef<"Investor", 'String'>
    readonly nameEn: FieldRef<"Investor", 'String'>
    readonly type: FieldRef<"Investor", 'InvestorType'>
    readonly tier: FieldRef<"Investor", 'InvestorTier'>
    readonly status: FieldRef<"Investor", 'InvestorStatus'>
    readonly country: FieldRef<"Investor", 'String'>
    readonly region: FieldRef<"Investor", 'String'>
    readonly contactName: FieldRef<"Investor", 'String'>
    readonly contactEmail: FieldRef<"Investor", 'String'>
    readonly contactPhone: FieldRef<"Investor", 'String'>
    readonly investmentCapacity: FieldRef<"Investor", 'Int'>
    readonly minTicket: FieldRef<"Investor", 'Int'>
    readonly maxTicket: FieldRef<"Investor", 'Int'>
    readonly preferredGenres: FieldRef<"Investor", 'String'>
    readonly preferredBudgetRange: FieldRef<"Investor", 'String'>
    readonly pastInvestments: FieldRef<"Investor", 'String'>
    readonly notes: FieldRef<"Investor", 'String'>
    readonly createdAt: FieldRef<"Investor", 'DateTime'>
    readonly updatedAt: FieldRef<"Investor", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Investor findUnique
   */
  export type InvestorFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Investor
     */
    select?: InvestorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Investor
     */
    omit?: InvestorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InvestorInclude<ExtArgs> | null
    /**
     * Filter, which Investor to fetch.
     */
    where: InvestorWhereUniqueInput
  }

  /**
   * Investor findUniqueOrThrow
   */
  export type InvestorFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Investor
     */
    select?: InvestorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Investor
     */
    omit?: InvestorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InvestorInclude<ExtArgs> | null
    /**
     * Filter, which Investor to fetch.
     */
    where: InvestorWhereUniqueInput
  }

  /**
   * Investor findFirst
   */
  export type InvestorFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Investor
     */
    select?: InvestorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Investor
     */
    omit?: InvestorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InvestorInclude<ExtArgs> | null
    /**
     * Filter, which Investor to fetch.
     */
    where?: InvestorWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Investors to fetch.
     */
    orderBy?: InvestorOrderByWithRelationInput | InvestorOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Investors.
     */
    cursor?: InvestorWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Investors from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Investors.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Investors.
     */
    distinct?: InvestorScalarFieldEnum | InvestorScalarFieldEnum[]
  }

  /**
   * Investor findFirstOrThrow
   */
  export type InvestorFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Investor
     */
    select?: InvestorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Investor
     */
    omit?: InvestorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InvestorInclude<ExtArgs> | null
    /**
     * Filter, which Investor to fetch.
     */
    where?: InvestorWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Investors to fetch.
     */
    orderBy?: InvestorOrderByWithRelationInput | InvestorOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Investors.
     */
    cursor?: InvestorWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Investors from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Investors.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Investors.
     */
    distinct?: InvestorScalarFieldEnum | InvestorScalarFieldEnum[]
  }

  /**
   * Investor findMany
   */
  export type InvestorFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Investor
     */
    select?: InvestorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Investor
     */
    omit?: InvestorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InvestorInclude<ExtArgs> | null
    /**
     * Filter, which Investors to fetch.
     */
    where?: InvestorWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Investors to fetch.
     */
    orderBy?: InvestorOrderByWithRelationInput | InvestorOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Investors.
     */
    cursor?: InvestorWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Investors from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Investors.
     */
    skip?: number
    distinct?: InvestorScalarFieldEnum | InvestorScalarFieldEnum[]
  }

  /**
   * Investor create
   */
  export type InvestorCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Investor
     */
    select?: InvestorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Investor
     */
    omit?: InvestorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InvestorInclude<ExtArgs> | null
    /**
     * The data needed to create a Investor.
     */
    data: XOR<InvestorCreateInput, InvestorUncheckedCreateInput>
  }

  /**
   * Investor createMany
   */
  export type InvestorCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Investors.
     */
    data: InvestorCreateManyInput | InvestorCreateManyInput[]
  }

  /**
   * Investor createManyAndReturn
   */
  export type InvestorCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Investor
     */
    select?: InvestorSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Investor
     */
    omit?: InvestorOmit<ExtArgs> | null
    /**
     * The data used to create many Investors.
     */
    data: InvestorCreateManyInput | InvestorCreateManyInput[]
  }

  /**
   * Investor update
   */
  export type InvestorUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Investor
     */
    select?: InvestorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Investor
     */
    omit?: InvestorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InvestorInclude<ExtArgs> | null
    /**
     * The data needed to update a Investor.
     */
    data: XOR<InvestorUpdateInput, InvestorUncheckedUpdateInput>
    /**
     * Choose, which Investor to update.
     */
    where: InvestorWhereUniqueInput
  }

  /**
   * Investor updateMany
   */
  export type InvestorUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Investors.
     */
    data: XOR<InvestorUpdateManyMutationInput, InvestorUncheckedUpdateManyInput>
    /**
     * Filter which Investors to update
     */
    where?: InvestorWhereInput
    /**
     * Limit how many Investors to update.
     */
    limit?: number
  }

  /**
   * Investor updateManyAndReturn
   */
  export type InvestorUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Investor
     */
    select?: InvestorSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Investor
     */
    omit?: InvestorOmit<ExtArgs> | null
    /**
     * The data used to update Investors.
     */
    data: XOR<InvestorUpdateManyMutationInput, InvestorUncheckedUpdateManyInput>
    /**
     * Filter which Investors to update
     */
    where?: InvestorWhereInput
    /**
     * Limit how many Investors to update.
     */
    limit?: number
  }

  /**
   * Investor upsert
   */
  export type InvestorUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Investor
     */
    select?: InvestorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Investor
     */
    omit?: InvestorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InvestorInclude<ExtArgs> | null
    /**
     * The filter to search for the Investor to update in case it exists.
     */
    where: InvestorWhereUniqueInput
    /**
     * In case the Investor found by the `where` argument doesn't exist, create a new Investor with this data.
     */
    create: XOR<InvestorCreateInput, InvestorUncheckedCreateInput>
    /**
     * In case the Investor was found with the provided `where` argument, update it with this data.
     */
    update: XOR<InvestorUpdateInput, InvestorUncheckedUpdateInput>
  }

  /**
   * Investor delete
   */
  export type InvestorDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Investor
     */
    select?: InvestorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Investor
     */
    omit?: InvestorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InvestorInclude<ExtArgs> | null
    /**
     * Filter which Investor to delete.
     */
    where: InvestorWhereUniqueInput
  }

  /**
   * Investor deleteMany
   */
  export type InvestorDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Investors to delete
     */
    where?: InvestorWhereInput
    /**
     * Limit how many Investors to delete.
     */
    limit?: number
  }

  /**
   * Investor.groupMemberships
   */
  export type Investor$groupMembershipsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InvestorGroupMember
     */
    select?: InvestorGroupMemberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InvestorGroupMember
     */
    omit?: InvestorGroupMemberOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InvestorGroupMemberInclude<ExtArgs> | null
    where?: InvestorGroupMemberWhereInput
    orderBy?: InvestorGroupMemberOrderByWithRelationInput | InvestorGroupMemberOrderByWithRelationInput[]
    cursor?: InvestorGroupMemberWhereUniqueInput
    take?: number
    skip?: number
    distinct?: InvestorGroupMemberScalarFieldEnum | InvestorGroupMemberScalarFieldEnum[]
  }

  /**
   * Investor.tranchePositions
   */
  export type Investor$tranchePositionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PFTrancheInvestor
     */
    select?: PFTrancheInvestorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PFTrancheInvestor
     */
    omit?: PFTrancheInvestorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PFTrancheInvestorInclude<ExtArgs> | null
    where?: PFTrancheInvestorWhereInput
    orderBy?: PFTrancheInvestorOrderByWithRelationInput | PFTrancheInvestorOrderByWithRelationInput[]
    cursor?: PFTrancheInvestorWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PFTrancheInvestorScalarFieldEnum | PFTrancheInvestorScalarFieldEnum[]
  }

  /**
   * Investor without action
   */
  export type InvestorDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Investor
     */
    select?: InvestorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Investor
     */
    omit?: InvestorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InvestorInclude<ExtArgs> | null
  }


  /**
   * Model InvestorGroup
   */

  export type AggregateInvestorGroup = {
    _count: InvestorGroupCountAggregateOutputType | null
    _avg: InvestorGroupAvgAggregateOutputType | null
    _sum: InvestorGroupSumAggregateOutputType | null
    _min: InvestorGroupMinAggregateOutputType | null
    _max: InvestorGroupMaxAggregateOutputType | null
  }

  export type InvestorGroupAvgAggregateOutputType = {
    totalCommitment: number | null
  }

  export type InvestorGroupSumAggregateOutputType = {
    totalCommitment: number | null
  }

  export type InvestorGroupMinAggregateOutputType = {
    id: string | null
    name: string | null
    type: $Enums.InvestorGroupType | null
    managingFirm: string | null
    totalCommitment: number | null
    status: $Enums.InvestorGroupStatus | null
    notes: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type InvestorGroupMaxAggregateOutputType = {
    id: string | null
    name: string | null
    type: $Enums.InvestorGroupType | null
    managingFirm: string | null
    totalCommitment: number | null
    status: $Enums.InvestorGroupStatus | null
    notes: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type InvestorGroupCountAggregateOutputType = {
    id: number
    name: number
    type: number
    managingFirm: number
    totalCommitment: number
    status: number
    notes: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type InvestorGroupAvgAggregateInputType = {
    totalCommitment?: true
  }

  export type InvestorGroupSumAggregateInputType = {
    totalCommitment?: true
  }

  export type InvestorGroupMinAggregateInputType = {
    id?: true
    name?: true
    type?: true
    managingFirm?: true
    totalCommitment?: true
    status?: true
    notes?: true
    createdAt?: true
    updatedAt?: true
  }

  export type InvestorGroupMaxAggregateInputType = {
    id?: true
    name?: true
    type?: true
    managingFirm?: true
    totalCommitment?: true
    status?: true
    notes?: true
    createdAt?: true
    updatedAt?: true
  }

  export type InvestorGroupCountAggregateInputType = {
    id?: true
    name?: true
    type?: true
    managingFirm?: true
    totalCommitment?: true
    status?: true
    notes?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type InvestorGroupAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which InvestorGroup to aggregate.
     */
    where?: InvestorGroupWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of InvestorGroups to fetch.
     */
    orderBy?: InvestorGroupOrderByWithRelationInput | InvestorGroupOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: InvestorGroupWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` InvestorGroups from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` InvestorGroups.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned InvestorGroups
    **/
    _count?: true | InvestorGroupCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: InvestorGroupAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: InvestorGroupSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: InvestorGroupMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: InvestorGroupMaxAggregateInputType
  }

  export type GetInvestorGroupAggregateType<T extends InvestorGroupAggregateArgs> = {
        [P in keyof T & keyof AggregateInvestorGroup]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateInvestorGroup[P]>
      : GetScalarType<T[P], AggregateInvestorGroup[P]>
  }




  export type InvestorGroupGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: InvestorGroupWhereInput
    orderBy?: InvestorGroupOrderByWithAggregationInput | InvestorGroupOrderByWithAggregationInput[]
    by: InvestorGroupScalarFieldEnum[] | InvestorGroupScalarFieldEnum
    having?: InvestorGroupScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: InvestorGroupCountAggregateInputType | true
    _avg?: InvestorGroupAvgAggregateInputType
    _sum?: InvestorGroupSumAggregateInputType
    _min?: InvestorGroupMinAggregateInputType
    _max?: InvestorGroupMaxAggregateInputType
  }

  export type InvestorGroupGroupByOutputType = {
    id: string
    name: string
    type: $Enums.InvestorGroupType
    managingFirm: string | null
    totalCommitment: number | null
    status: $Enums.InvestorGroupStatus
    notes: string | null
    createdAt: Date
    updatedAt: Date
    _count: InvestorGroupCountAggregateOutputType | null
    _avg: InvestorGroupAvgAggregateOutputType | null
    _sum: InvestorGroupSumAggregateOutputType | null
    _min: InvestorGroupMinAggregateOutputType | null
    _max: InvestorGroupMaxAggregateOutputType | null
  }

  type GetInvestorGroupGroupByPayload<T extends InvestorGroupGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<InvestorGroupGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof InvestorGroupGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], InvestorGroupGroupByOutputType[P]>
            : GetScalarType<T[P], InvestorGroupGroupByOutputType[P]>
        }
      >
    >


  export type InvestorGroupSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    type?: boolean
    managingFirm?: boolean
    totalCommitment?: boolean
    status?: boolean
    notes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    members?: boolean | InvestorGroup$membersArgs<ExtArgs>
    _count?: boolean | InvestorGroupCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["investorGroup"]>

  export type InvestorGroupSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    type?: boolean
    managingFirm?: boolean
    totalCommitment?: boolean
    status?: boolean
    notes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["investorGroup"]>

  export type InvestorGroupSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    type?: boolean
    managingFirm?: boolean
    totalCommitment?: boolean
    status?: boolean
    notes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["investorGroup"]>

  export type InvestorGroupSelectScalar = {
    id?: boolean
    name?: boolean
    type?: boolean
    managingFirm?: boolean
    totalCommitment?: boolean
    status?: boolean
    notes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type InvestorGroupOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "type" | "managingFirm" | "totalCommitment" | "status" | "notes" | "createdAt" | "updatedAt", ExtArgs["result"]["investorGroup"]>
  export type InvestorGroupInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    members?: boolean | InvestorGroup$membersArgs<ExtArgs>
    _count?: boolean | InvestorGroupCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type InvestorGroupIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type InvestorGroupIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $InvestorGroupPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "InvestorGroup"
    objects: {
      members: Prisma.$InvestorGroupMemberPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      /**
       * PEF | VCF | 공공기금 | 개인투자조합 | 배급펀드
       */
      type: $Enums.InvestorGroupType
      managingFirm: string | null
      /**
       * 총 약정 금액 (만원)
       */
      totalCommitment: number | null
      status: $Enums.InvestorGroupStatus
      notes: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["investorGroup"]>
    composites: {}
  }

  type InvestorGroupGetPayload<S extends boolean | null | undefined | InvestorGroupDefaultArgs> = $Result.GetResult<Prisma.$InvestorGroupPayload, S>

  type InvestorGroupCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<InvestorGroupFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: InvestorGroupCountAggregateInputType | true
    }

  export interface InvestorGroupDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['InvestorGroup'], meta: { name: 'InvestorGroup' } }
    /**
     * Find zero or one InvestorGroup that matches the filter.
     * @param {InvestorGroupFindUniqueArgs} args - Arguments to find a InvestorGroup
     * @example
     * // Get one InvestorGroup
     * const investorGroup = await prisma.investorGroup.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends InvestorGroupFindUniqueArgs>(args: SelectSubset<T, InvestorGroupFindUniqueArgs<ExtArgs>>): Prisma__InvestorGroupClient<$Result.GetResult<Prisma.$InvestorGroupPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one InvestorGroup that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {InvestorGroupFindUniqueOrThrowArgs} args - Arguments to find a InvestorGroup
     * @example
     * // Get one InvestorGroup
     * const investorGroup = await prisma.investorGroup.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends InvestorGroupFindUniqueOrThrowArgs>(args: SelectSubset<T, InvestorGroupFindUniqueOrThrowArgs<ExtArgs>>): Prisma__InvestorGroupClient<$Result.GetResult<Prisma.$InvestorGroupPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first InvestorGroup that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InvestorGroupFindFirstArgs} args - Arguments to find a InvestorGroup
     * @example
     * // Get one InvestorGroup
     * const investorGroup = await prisma.investorGroup.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends InvestorGroupFindFirstArgs>(args?: SelectSubset<T, InvestorGroupFindFirstArgs<ExtArgs>>): Prisma__InvestorGroupClient<$Result.GetResult<Prisma.$InvestorGroupPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first InvestorGroup that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InvestorGroupFindFirstOrThrowArgs} args - Arguments to find a InvestorGroup
     * @example
     * // Get one InvestorGroup
     * const investorGroup = await prisma.investorGroup.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends InvestorGroupFindFirstOrThrowArgs>(args?: SelectSubset<T, InvestorGroupFindFirstOrThrowArgs<ExtArgs>>): Prisma__InvestorGroupClient<$Result.GetResult<Prisma.$InvestorGroupPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more InvestorGroups that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InvestorGroupFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all InvestorGroups
     * const investorGroups = await prisma.investorGroup.findMany()
     * 
     * // Get first 10 InvestorGroups
     * const investorGroups = await prisma.investorGroup.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const investorGroupWithIdOnly = await prisma.investorGroup.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends InvestorGroupFindManyArgs>(args?: SelectSubset<T, InvestorGroupFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InvestorGroupPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a InvestorGroup.
     * @param {InvestorGroupCreateArgs} args - Arguments to create a InvestorGroup.
     * @example
     * // Create one InvestorGroup
     * const InvestorGroup = await prisma.investorGroup.create({
     *   data: {
     *     // ... data to create a InvestorGroup
     *   }
     * })
     * 
     */
    create<T extends InvestorGroupCreateArgs>(args: SelectSubset<T, InvestorGroupCreateArgs<ExtArgs>>): Prisma__InvestorGroupClient<$Result.GetResult<Prisma.$InvestorGroupPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many InvestorGroups.
     * @param {InvestorGroupCreateManyArgs} args - Arguments to create many InvestorGroups.
     * @example
     * // Create many InvestorGroups
     * const investorGroup = await prisma.investorGroup.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends InvestorGroupCreateManyArgs>(args?: SelectSubset<T, InvestorGroupCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many InvestorGroups and returns the data saved in the database.
     * @param {InvestorGroupCreateManyAndReturnArgs} args - Arguments to create many InvestorGroups.
     * @example
     * // Create many InvestorGroups
     * const investorGroup = await prisma.investorGroup.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many InvestorGroups and only return the `id`
     * const investorGroupWithIdOnly = await prisma.investorGroup.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends InvestorGroupCreateManyAndReturnArgs>(args?: SelectSubset<T, InvestorGroupCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InvestorGroupPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a InvestorGroup.
     * @param {InvestorGroupDeleteArgs} args - Arguments to delete one InvestorGroup.
     * @example
     * // Delete one InvestorGroup
     * const InvestorGroup = await prisma.investorGroup.delete({
     *   where: {
     *     // ... filter to delete one InvestorGroup
     *   }
     * })
     * 
     */
    delete<T extends InvestorGroupDeleteArgs>(args: SelectSubset<T, InvestorGroupDeleteArgs<ExtArgs>>): Prisma__InvestorGroupClient<$Result.GetResult<Prisma.$InvestorGroupPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one InvestorGroup.
     * @param {InvestorGroupUpdateArgs} args - Arguments to update one InvestorGroup.
     * @example
     * // Update one InvestorGroup
     * const investorGroup = await prisma.investorGroup.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends InvestorGroupUpdateArgs>(args: SelectSubset<T, InvestorGroupUpdateArgs<ExtArgs>>): Prisma__InvestorGroupClient<$Result.GetResult<Prisma.$InvestorGroupPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more InvestorGroups.
     * @param {InvestorGroupDeleteManyArgs} args - Arguments to filter InvestorGroups to delete.
     * @example
     * // Delete a few InvestorGroups
     * const { count } = await prisma.investorGroup.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends InvestorGroupDeleteManyArgs>(args?: SelectSubset<T, InvestorGroupDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more InvestorGroups.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InvestorGroupUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many InvestorGroups
     * const investorGroup = await prisma.investorGroup.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends InvestorGroupUpdateManyArgs>(args: SelectSubset<T, InvestorGroupUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more InvestorGroups and returns the data updated in the database.
     * @param {InvestorGroupUpdateManyAndReturnArgs} args - Arguments to update many InvestorGroups.
     * @example
     * // Update many InvestorGroups
     * const investorGroup = await prisma.investorGroup.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more InvestorGroups and only return the `id`
     * const investorGroupWithIdOnly = await prisma.investorGroup.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends InvestorGroupUpdateManyAndReturnArgs>(args: SelectSubset<T, InvestorGroupUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InvestorGroupPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one InvestorGroup.
     * @param {InvestorGroupUpsertArgs} args - Arguments to update or create a InvestorGroup.
     * @example
     * // Update or create a InvestorGroup
     * const investorGroup = await prisma.investorGroup.upsert({
     *   create: {
     *     // ... data to create a InvestorGroup
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the InvestorGroup we want to update
     *   }
     * })
     */
    upsert<T extends InvestorGroupUpsertArgs>(args: SelectSubset<T, InvestorGroupUpsertArgs<ExtArgs>>): Prisma__InvestorGroupClient<$Result.GetResult<Prisma.$InvestorGroupPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of InvestorGroups.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InvestorGroupCountArgs} args - Arguments to filter InvestorGroups to count.
     * @example
     * // Count the number of InvestorGroups
     * const count = await prisma.investorGroup.count({
     *   where: {
     *     // ... the filter for the InvestorGroups we want to count
     *   }
     * })
    **/
    count<T extends InvestorGroupCountArgs>(
      args?: Subset<T, InvestorGroupCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], InvestorGroupCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a InvestorGroup.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InvestorGroupAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends InvestorGroupAggregateArgs>(args: Subset<T, InvestorGroupAggregateArgs>): Prisma.PrismaPromise<GetInvestorGroupAggregateType<T>>

    /**
     * Group by InvestorGroup.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InvestorGroupGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends InvestorGroupGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: InvestorGroupGroupByArgs['orderBy'] }
        : { orderBy?: InvestorGroupGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, InvestorGroupGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetInvestorGroupGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the InvestorGroup model
   */
  readonly fields: InvestorGroupFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for InvestorGroup.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__InvestorGroupClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    members<T extends InvestorGroup$membersArgs<ExtArgs> = {}>(args?: Subset<T, InvestorGroup$membersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InvestorGroupMemberPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the InvestorGroup model
   */
  interface InvestorGroupFieldRefs {
    readonly id: FieldRef<"InvestorGroup", 'String'>
    readonly name: FieldRef<"InvestorGroup", 'String'>
    readonly type: FieldRef<"InvestorGroup", 'InvestorGroupType'>
    readonly managingFirm: FieldRef<"InvestorGroup", 'String'>
    readonly totalCommitment: FieldRef<"InvestorGroup", 'Int'>
    readonly status: FieldRef<"InvestorGroup", 'InvestorGroupStatus'>
    readonly notes: FieldRef<"InvestorGroup", 'String'>
    readonly createdAt: FieldRef<"InvestorGroup", 'DateTime'>
    readonly updatedAt: FieldRef<"InvestorGroup", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * InvestorGroup findUnique
   */
  export type InvestorGroupFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InvestorGroup
     */
    select?: InvestorGroupSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InvestorGroup
     */
    omit?: InvestorGroupOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InvestorGroupInclude<ExtArgs> | null
    /**
     * Filter, which InvestorGroup to fetch.
     */
    where: InvestorGroupWhereUniqueInput
  }

  /**
   * InvestorGroup findUniqueOrThrow
   */
  export type InvestorGroupFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InvestorGroup
     */
    select?: InvestorGroupSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InvestorGroup
     */
    omit?: InvestorGroupOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InvestorGroupInclude<ExtArgs> | null
    /**
     * Filter, which InvestorGroup to fetch.
     */
    where: InvestorGroupWhereUniqueInput
  }

  /**
   * InvestorGroup findFirst
   */
  export type InvestorGroupFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InvestorGroup
     */
    select?: InvestorGroupSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InvestorGroup
     */
    omit?: InvestorGroupOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InvestorGroupInclude<ExtArgs> | null
    /**
     * Filter, which InvestorGroup to fetch.
     */
    where?: InvestorGroupWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of InvestorGroups to fetch.
     */
    orderBy?: InvestorGroupOrderByWithRelationInput | InvestorGroupOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for InvestorGroups.
     */
    cursor?: InvestorGroupWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` InvestorGroups from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` InvestorGroups.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of InvestorGroups.
     */
    distinct?: InvestorGroupScalarFieldEnum | InvestorGroupScalarFieldEnum[]
  }

  /**
   * InvestorGroup findFirstOrThrow
   */
  export type InvestorGroupFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InvestorGroup
     */
    select?: InvestorGroupSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InvestorGroup
     */
    omit?: InvestorGroupOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InvestorGroupInclude<ExtArgs> | null
    /**
     * Filter, which InvestorGroup to fetch.
     */
    where?: InvestorGroupWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of InvestorGroups to fetch.
     */
    orderBy?: InvestorGroupOrderByWithRelationInput | InvestorGroupOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for InvestorGroups.
     */
    cursor?: InvestorGroupWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` InvestorGroups from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` InvestorGroups.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of InvestorGroups.
     */
    distinct?: InvestorGroupScalarFieldEnum | InvestorGroupScalarFieldEnum[]
  }

  /**
   * InvestorGroup findMany
   */
  export type InvestorGroupFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InvestorGroup
     */
    select?: InvestorGroupSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InvestorGroup
     */
    omit?: InvestorGroupOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InvestorGroupInclude<ExtArgs> | null
    /**
     * Filter, which InvestorGroups to fetch.
     */
    where?: InvestorGroupWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of InvestorGroups to fetch.
     */
    orderBy?: InvestorGroupOrderByWithRelationInput | InvestorGroupOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing InvestorGroups.
     */
    cursor?: InvestorGroupWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` InvestorGroups from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` InvestorGroups.
     */
    skip?: number
    distinct?: InvestorGroupScalarFieldEnum | InvestorGroupScalarFieldEnum[]
  }

  /**
   * InvestorGroup create
   */
  export type InvestorGroupCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InvestorGroup
     */
    select?: InvestorGroupSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InvestorGroup
     */
    omit?: InvestorGroupOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InvestorGroupInclude<ExtArgs> | null
    /**
     * The data needed to create a InvestorGroup.
     */
    data: XOR<InvestorGroupCreateInput, InvestorGroupUncheckedCreateInput>
  }

  /**
   * InvestorGroup createMany
   */
  export type InvestorGroupCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many InvestorGroups.
     */
    data: InvestorGroupCreateManyInput | InvestorGroupCreateManyInput[]
  }

  /**
   * InvestorGroup createManyAndReturn
   */
  export type InvestorGroupCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InvestorGroup
     */
    select?: InvestorGroupSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the InvestorGroup
     */
    omit?: InvestorGroupOmit<ExtArgs> | null
    /**
     * The data used to create many InvestorGroups.
     */
    data: InvestorGroupCreateManyInput | InvestorGroupCreateManyInput[]
  }

  /**
   * InvestorGroup update
   */
  export type InvestorGroupUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InvestorGroup
     */
    select?: InvestorGroupSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InvestorGroup
     */
    omit?: InvestorGroupOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InvestorGroupInclude<ExtArgs> | null
    /**
     * The data needed to update a InvestorGroup.
     */
    data: XOR<InvestorGroupUpdateInput, InvestorGroupUncheckedUpdateInput>
    /**
     * Choose, which InvestorGroup to update.
     */
    where: InvestorGroupWhereUniqueInput
  }

  /**
   * InvestorGroup updateMany
   */
  export type InvestorGroupUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update InvestorGroups.
     */
    data: XOR<InvestorGroupUpdateManyMutationInput, InvestorGroupUncheckedUpdateManyInput>
    /**
     * Filter which InvestorGroups to update
     */
    where?: InvestorGroupWhereInput
    /**
     * Limit how many InvestorGroups to update.
     */
    limit?: number
  }

  /**
   * InvestorGroup updateManyAndReturn
   */
  export type InvestorGroupUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InvestorGroup
     */
    select?: InvestorGroupSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the InvestorGroup
     */
    omit?: InvestorGroupOmit<ExtArgs> | null
    /**
     * The data used to update InvestorGroups.
     */
    data: XOR<InvestorGroupUpdateManyMutationInput, InvestorGroupUncheckedUpdateManyInput>
    /**
     * Filter which InvestorGroups to update
     */
    where?: InvestorGroupWhereInput
    /**
     * Limit how many InvestorGroups to update.
     */
    limit?: number
  }

  /**
   * InvestorGroup upsert
   */
  export type InvestorGroupUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InvestorGroup
     */
    select?: InvestorGroupSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InvestorGroup
     */
    omit?: InvestorGroupOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InvestorGroupInclude<ExtArgs> | null
    /**
     * The filter to search for the InvestorGroup to update in case it exists.
     */
    where: InvestorGroupWhereUniqueInput
    /**
     * In case the InvestorGroup found by the `where` argument doesn't exist, create a new InvestorGroup with this data.
     */
    create: XOR<InvestorGroupCreateInput, InvestorGroupUncheckedCreateInput>
    /**
     * In case the InvestorGroup was found with the provided `where` argument, update it with this data.
     */
    update: XOR<InvestorGroupUpdateInput, InvestorGroupUncheckedUpdateInput>
  }

  /**
   * InvestorGroup delete
   */
  export type InvestorGroupDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InvestorGroup
     */
    select?: InvestorGroupSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InvestorGroup
     */
    omit?: InvestorGroupOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InvestorGroupInclude<ExtArgs> | null
    /**
     * Filter which InvestorGroup to delete.
     */
    where: InvestorGroupWhereUniqueInput
  }

  /**
   * InvestorGroup deleteMany
   */
  export type InvestorGroupDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which InvestorGroups to delete
     */
    where?: InvestorGroupWhereInput
    /**
     * Limit how many InvestorGroups to delete.
     */
    limit?: number
  }

  /**
   * InvestorGroup.members
   */
  export type InvestorGroup$membersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InvestorGroupMember
     */
    select?: InvestorGroupMemberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InvestorGroupMember
     */
    omit?: InvestorGroupMemberOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InvestorGroupMemberInclude<ExtArgs> | null
    where?: InvestorGroupMemberWhereInput
    orderBy?: InvestorGroupMemberOrderByWithRelationInput | InvestorGroupMemberOrderByWithRelationInput[]
    cursor?: InvestorGroupMemberWhereUniqueInput
    take?: number
    skip?: number
    distinct?: InvestorGroupMemberScalarFieldEnum | InvestorGroupMemberScalarFieldEnum[]
  }

  /**
   * InvestorGroup without action
   */
  export type InvestorGroupDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InvestorGroup
     */
    select?: InvestorGroupSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InvestorGroup
     */
    omit?: InvestorGroupOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InvestorGroupInclude<ExtArgs> | null
  }


  /**
   * Model InvestorGroupMember
   */

  export type AggregateInvestorGroupMember = {
    _count: InvestorGroupMemberCountAggregateOutputType | null
    _avg: InvestorGroupMemberAvgAggregateOutputType | null
    _sum: InvestorGroupMemberSumAggregateOutputType | null
    _min: InvestorGroupMemberMinAggregateOutputType | null
    _max: InvestorGroupMemberMaxAggregateOutputType | null
  }

  export type InvestorGroupMemberAvgAggregateOutputType = {
    commitment: number | null
  }

  export type InvestorGroupMemberSumAggregateOutputType = {
    commitment: number | null
  }

  export type InvestorGroupMemberMinAggregateOutputType = {
    id: string | null
    groupId: string | null
    investorId: string | null
    commitment: number | null
    role: string | null
    joinedAt: Date | null
  }

  export type InvestorGroupMemberMaxAggregateOutputType = {
    id: string | null
    groupId: string | null
    investorId: string | null
    commitment: number | null
    role: string | null
    joinedAt: Date | null
  }

  export type InvestorGroupMemberCountAggregateOutputType = {
    id: number
    groupId: number
    investorId: number
    commitment: number
    role: number
    joinedAt: number
    _all: number
  }


  export type InvestorGroupMemberAvgAggregateInputType = {
    commitment?: true
  }

  export type InvestorGroupMemberSumAggregateInputType = {
    commitment?: true
  }

  export type InvestorGroupMemberMinAggregateInputType = {
    id?: true
    groupId?: true
    investorId?: true
    commitment?: true
    role?: true
    joinedAt?: true
  }

  export type InvestorGroupMemberMaxAggregateInputType = {
    id?: true
    groupId?: true
    investorId?: true
    commitment?: true
    role?: true
    joinedAt?: true
  }

  export type InvestorGroupMemberCountAggregateInputType = {
    id?: true
    groupId?: true
    investorId?: true
    commitment?: true
    role?: true
    joinedAt?: true
    _all?: true
  }

  export type InvestorGroupMemberAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which InvestorGroupMember to aggregate.
     */
    where?: InvestorGroupMemberWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of InvestorGroupMembers to fetch.
     */
    orderBy?: InvestorGroupMemberOrderByWithRelationInput | InvestorGroupMemberOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: InvestorGroupMemberWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` InvestorGroupMembers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` InvestorGroupMembers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned InvestorGroupMembers
    **/
    _count?: true | InvestorGroupMemberCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: InvestorGroupMemberAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: InvestorGroupMemberSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: InvestorGroupMemberMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: InvestorGroupMemberMaxAggregateInputType
  }

  export type GetInvestorGroupMemberAggregateType<T extends InvestorGroupMemberAggregateArgs> = {
        [P in keyof T & keyof AggregateInvestorGroupMember]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateInvestorGroupMember[P]>
      : GetScalarType<T[P], AggregateInvestorGroupMember[P]>
  }




  export type InvestorGroupMemberGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: InvestorGroupMemberWhereInput
    orderBy?: InvestorGroupMemberOrderByWithAggregationInput | InvestorGroupMemberOrderByWithAggregationInput[]
    by: InvestorGroupMemberScalarFieldEnum[] | InvestorGroupMemberScalarFieldEnum
    having?: InvestorGroupMemberScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: InvestorGroupMemberCountAggregateInputType | true
    _avg?: InvestorGroupMemberAvgAggregateInputType
    _sum?: InvestorGroupMemberSumAggregateInputType
    _min?: InvestorGroupMemberMinAggregateInputType
    _max?: InvestorGroupMemberMaxAggregateInputType
  }

  export type InvestorGroupMemberGroupByOutputType = {
    id: string
    groupId: string
    investorId: string
    commitment: number | null
    role: string
    joinedAt: Date
    _count: InvestorGroupMemberCountAggregateOutputType | null
    _avg: InvestorGroupMemberAvgAggregateOutputType | null
    _sum: InvestorGroupMemberSumAggregateOutputType | null
    _min: InvestorGroupMemberMinAggregateOutputType | null
    _max: InvestorGroupMemberMaxAggregateOutputType | null
  }

  type GetInvestorGroupMemberGroupByPayload<T extends InvestorGroupMemberGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<InvestorGroupMemberGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof InvestorGroupMemberGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], InvestorGroupMemberGroupByOutputType[P]>
            : GetScalarType<T[P], InvestorGroupMemberGroupByOutputType[P]>
        }
      >
    >


  export type InvestorGroupMemberSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    groupId?: boolean
    investorId?: boolean
    commitment?: boolean
    role?: boolean
    joinedAt?: boolean
    group?: boolean | InvestorGroupDefaultArgs<ExtArgs>
    investor?: boolean | InvestorDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["investorGroupMember"]>

  export type InvestorGroupMemberSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    groupId?: boolean
    investorId?: boolean
    commitment?: boolean
    role?: boolean
    joinedAt?: boolean
    group?: boolean | InvestorGroupDefaultArgs<ExtArgs>
    investor?: boolean | InvestorDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["investorGroupMember"]>

  export type InvestorGroupMemberSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    groupId?: boolean
    investorId?: boolean
    commitment?: boolean
    role?: boolean
    joinedAt?: boolean
    group?: boolean | InvestorGroupDefaultArgs<ExtArgs>
    investor?: boolean | InvestorDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["investorGroupMember"]>

  export type InvestorGroupMemberSelectScalar = {
    id?: boolean
    groupId?: boolean
    investorId?: boolean
    commitment?: boolean
    role?: boolean
    joinedAt?: boolean
  }

  export type InvestorGroupMemberOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "groupId" | "investorId" | "commitment" | "role" | "joinedAt", ExtArgs["result"]["investorGroupMember"]>
  export type InvestorGroupMemberInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    group?: boolean | InvestorGroupDefaultArgs<ExtArgs>
    investor?: boolean | InvestorDefaultArgs<ExtArgs>
  }
  export type InvestorGroupMemberIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    group?: boolean | InvestorGroupDefaultArgs<ExtArgs>
    investor?: boolean | InvestorDefaultArgs<ExtArgs>
  }
  export type InvestorGroupMemberIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    group?: boolean | InvestorGroupDefaultArgs<ExtArgs>
    investor?: boolean | InvestorDefaultArgs<ExtArgs>
  }

  export type $InvestorGroupMemberPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "InvestorGroupMember"
    objects: {
      group: Prisma.$InvestorGroupPayload<ExtArgs>
      investor: Prisma.$InvestorPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      groupId: string
      investorId: string
      /**
       * 개인 약정액 (만원)
       */
      commitment: number | null
      /**
       * LP | GP | 리드 | 공동투자
       */
      role: string
      joinedAt: Date
    }, ExtArgs["result"]["investorGroupMember"]>
    composites: {}
  }

  type InvestorGroupMemberGetPayload<S extends boolean | null | undefined | InvestorGroupMemberDefaultArgs> = $Result.GetResult<Prisma.$InvestorGroupMemberPayload, S>

  type InvestorGroupMemberCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<InvestorGroupMemberFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: InvestorGroupMemberCountAggregateInputType | true
    }

  export interface InvestorGroupMemberDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['InvestorGroupMember'], meta: { name: 'InvestorGroupMember' } }
    /**
     * Find zero or one InvestorGroupMember that matches the filter.
     * @param {InvestorGroupMemberFindUniqueArgs} args - Arguments to find a InvestorGroupMember
     * @example
     * // Get one InvestorGroupMember
     * const investorGroupMember = await prisma.investorGroupMember.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends InvestorGroupMemberFindUniqueArgs>(args: SelectSubset<T, InvestorGroupMemberFindUniqueArgs<ExtArgs>>): Prisma__InvestorGroupMemberClient<$Result.GetResult<Prisma.$InvestorGroupMemberPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one InvestorGroupMember that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {InvestorGroupMemberFindUniqueOrThrowArgs} args - Arguments to find a InvestorGroupMember
     * @example
     * // Get one InvestorGroupMember
     * const investorGroupMember = await prisma.investorGroupMember.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends InvestorGroupMemberFindUniqueOrThrowArgs>(args: SelectSubset<T, InvestorGroupMemberFindUniqueOrThrowArgs<ExtArgs>>): Prisma__InvestorGroupMemberClient<$Result.GetResult<Prisma.$InvestorGroupMemberPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first InvestorGroupMember that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InvestorGroupMemberFindFirstArgs} args - Arguments to find a InvestorGroupMember
     * @example
     * // Get one InvestorGroupMember
     * const investorGroupMember = await prisma.investorGroupMember.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends InvestorGroupMemberFindFirstArgs>(args?: SelectSubset<T, InvestorGroupMemberFindFirstArgs<ExtArgs>>): Prisma__InvestorGroupMemberClient<$Result.GetResult<Prisma.$InvestorGroupMemberPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first InvestorGroupMember that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InvestorGroupMemberFindFirstOrThrowArgs} args - Arguments to find a InvestorGroupMember
     * @example
     * // Get one InvestorGroupMember
     * const investorGroupMember = await prisma.investorGroupMember.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends InvestorGroupMemberFindFirstOrThrowArgs>(args?: SelectSubset<T, InvestorGroupMemberFindFirstOrThrowArgs<ExtArgs>>): Prisma__InvestorGroupMemberClient<$Result.GetResult<Prisma.$InvestorGroupMemberPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more InvestorGroupMembers that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InvestorGroupMemberFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all InvestorGroupMembers
     * const investorGroupMembers = await prisma.investorGroupMember.findMany()
     * 
     * // Get first 10 InvestorGroupMembers
     * const investorGroupMembers = await prisma.investorGroupMember.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const investorGroupMemberWithIdOnly = await prisma.investorGroupMember.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends InvestorGroupMemberFindManyArgs>(args?: SelectSubset<T, InvestorGroupMemberFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InvestorGroupMemberPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a InvestorGroupMember.
     * @param {InvestorGroupMemberCreateArgs} args - Arguments to create a InvestorGroupMember.
     * @example
     * // Create one InvestorGroupMember
     * const InvestorGroupMember = await prisma.investorGroupMember.create({
     *   data: {
     *     // ... data to create a InvestorGroupMember
     *   }
     * })
     * 
     */
    create<T extends InvestorGroupMemberCreateArgs>(args: SelectSubset<T, InvestorGroupMemberCreateArgs<ExtArgs>>): Prisma__InvestorGroupMemberClient<$Result.GetResult<Prisma.$InvestorGroupMemberPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many InvestorGroupMembers.
     * @param {InvestorGroupMemberCreateManyArgs} args - Arguments to create many InvestorGroupMembers.
     * @example
     * // Create many InvestorGroupMembers
     * const investorGroupMember = await prisma.investorGroupMember.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends InvestorGroupMemberCreateManyArgs>(args?: SelectSubset<T, InvestorGroupMemberCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many InvestorGroupMembers and returns the data saved in the database.
     * @param {InvestorGroupMemberCreateManyAndReturnArgs} args - Arguments to create many InvestorGroupMembers.
     * @example
     * // Create many InvestorGroupMembers
     * const investorGroupMember = await prisma.investorGroupMember.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many InvestorGroupMembers and only return the `id`
     * const investorGroupMemberWithIdOnly = await prisma.investorGroupMember.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends InvestorGroupMemberCreateManyAndReturnArgs>(args?: SelectSubset<T, InvestorGroupMemberCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InvestorGroupMemberPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a InvestorGroupMember.
     * @param {InvestorGroupMemberDeleteArgs} args - Arguments to delete one InvestorGroupMember.
     * @example
     * // Delete one InvestorGroupMember
     * const InvestorGroupMember = await prisma.investorGroupMember.delete({
     *   where: {
     *     // ... filter to delete one InvestorGroupMember
     *   }
     * })
     * 
     */
    delete<T extends InvestorGroupMemberDeleteArgs>(args: SelectSubset<T, InvestorGroupMemberDeleteArgs<ExtArgs>>): Prisma__InvestorGroupMemberClient<$Result.GetResult<Prisma.$InvestorGroupMemberPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one InvestorGroupMember.
     * @param {InvestorGroupMemberUpdateArgs} args - Arguments to update one InvestorGroupMember.
     * @example
     * // Update one InvestorGroupMember
     * const investorGroupMember = await prisma.investorGroupMember.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends InvestorGroupMemberUpdateArgs>(args: SelectSubset<T, InvestorGroupMemberUpdateArgs<ExtArgs>>): Prisma__InvestorGroupMemberClient<$Result.GetResult<Prisma.$InvestorGroupMemberPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more InvestorGroupMembers.
     * @param {InvestorGroupMemberDeleteManyArgs} args - Arguments to filter InvestorGroupMembers to delete.
     * @example
     * // Delete a few InvestorGroupMembers
     * const { count } = await prisma.investorGroupMember.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends InvestorGroupMemberDeleteManyArgs>(args?: SelectSubset<T, InvestorGroupMemberDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more InvestorGroupMembers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InvestorGroupMemberUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many InvestorGroupMembers
     * const investorGroupMember = await prisma.investorGroupMember.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends InvestorGroupMemberUpdateManyArgs>(args: SelectSubset<T, InvestorGroupMemberUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more InvestorGroupMembers and returns the data updated in the database.
     * @param {InvestorGroupMemberUpdateManyAndReturnArgs} args - Arguments to update many InvestorGroupMembers.
     * @example
     * // Update many InvestorGroupMembers
     * const investorGroupMember = await prisma.investorGroupMember.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more InvestorGroupMembers and only return the `id`
     * const investorGroupMemberWithIdOnly = await prisma.investorGroupMember.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends InvestorGroupMemberUpdateManyAndReturnArgs>(args: SelectSubset<T, InvestorGroupMemberUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InvestorGroupMemberPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one InvestorGroupMember.
     * @param {InvestorGroupMemberUpsertArgs} args - Arguments to update or create a InvestorGroupMember.
     * @example
     * // Update or create a InvestorGroupMember
     * const investorGroupMember = await prisma.investorGroupMember.upsert({
     *   create: {
     *     // ... data to create a InvestorGroupMember
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the InvestorGroupMember we want to update
     *   }
     * })
     */
    upsert<T extends InvestorGroupMemberUpsertArgs>(args: SelectSubset<T, InvestorGroupMemberUpsertArgs<ExtArgs>>): Prisma__InvestorGroupMemberClient<$Result.GetResult<Prisma.$InvestorGroupMemberPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of InvestorGroupMembers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InvestorGroupMemberCountArgs} args - Arguments to filter InvestorGroupMembers to count.
     * @example
     * // Count the number of InvestorGroupMembers
     * const count = await prisma.investorGroupMember.count({
     *   where: {
     *     // ... the filter for the InvestorGroupMembers we want to count
     *   }
     * })
    **/
    count<T extends InvestorGroupMemberCountArgs>(
      args?: Subset<T, InvestorGroupMemberCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], InvestorGroupMemberCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a InvestorGroupMember.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InvestorGroupMemberAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends InvestorGroupMemberAggregateArgs>(args: Subset<T, InvestorGroupMemberAggregateArgs>): Prisma.PrismaPromise<GetInvestorGroupMemberAggregateType<T>>

    /**
     * Group by InvestorGroupMember.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InvestorGroupMemberGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends InvestorGroupMemberGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: InvestorGroupMemberGroupByArgs['orderBy'] }
        : { orderBy?: InvestorGroupMemberGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, InvestorGroupMemberGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetInvestorGroupMemberGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the InvestorGroupMember model
   */
  readonly fields: InvestorGroupMemberFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for InvestorGroupMember.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__InvestorGroupMemberClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    group<T extends InvestorGroupDefaultArgs<ExtArgs> = {}>(args?: Subset<T, InvestorGroupDefaultArgs<ExtArgs>>): Prisma__InvestorGroupClient<$Result.GetResult<Prisma.$InvestorGroupPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    investor<T extends InvestorDefaultArgs<ExtArgs> = {}>(args?: Subset<T, InvestorDefaultArgs<ExtArgs>>): Prisma__InvestorClient<$Result.GetResult<Prisma.$InvestorPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the InvestorGroupMember model
   */
  interface InvestorGroupMemberFieldRefs {
    readonly id: FieldRef<"InvestorGroupMember", 'String'>
    readonly groupId: FieldRef<"InvestorGroupMember", 'String'>
    readonly investorId: FieldRef<"InvestorGroupMember", 'String'>
    readonly commitment: FieldRef<"InvestorGroupMember", 'Int'>
    readonly role: FieldRef<"InvestorGroupMember", 'String'>
    readonly joinedAt: FieldRef<"InvestorGroupMember", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * InvestorGroupMember findUnique
   */
  export type InvestorGroupMemberFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InvestorGroupMember
     */
    select?: InvestorGroupMemberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InvestorGroupMember
     */
    omit?: InvestorGroupMemberOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InvestorGroupMemberInclude<ExtArgs> | null
    /**
     * Filter, which InvestorGroupMember to fetch.
     */
    where: InvestorGroupMemberWhereUniqueInput
  }

  /**
   * InvestorGroupMember findUniqueOrThrow
   */
  export type InvestorGroupMemberFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InvestorGroupMember
     */
    select?: InvestorGroupMemberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InvestorGroupMember
     */
    omit?: InvestorGroupMemberOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InvestorGroupMemberInclude<ExtArgs> | null
    /**
     * Filter, which InvestorGroupMember to fetch.
     */
    where: InvestorGroupMemberWhereUniqueInput
  }

  /**
   * InvestorGroupMember findFirst
   */
  export type InvestorGroupMemberFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InvestorGroupMember
     */
    select?: InvestorGroupMemberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InvestorGroupMember
     */
    omit?: InvestorGroupMemberOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InvestorGroupMemberInclude<ExtArgs> | null
    /**
     * Filter, which InvestorGroupMember to fetch.
     */
    where?: InvestorGroupMemberWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of InvestorGroupMembers to fetch.
     */
    orderBy?: InvestorGroupMemberOrderByWithRelationInput | InvestorGroupMemberOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for InvestorGroupMembers.
     */
    cursor?: InvestorGroupMemberWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` InvestorGroupMembers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` InvestorGroupMembers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of InvestorGroupMembers.
     */
    distinct?: InvestorGroupMemberScalarFieldEnum | InvestorGroupMemberScalarFieldEnum[]
  }

  /**
   * InvestorGroupMember findFirstOrThrow
   */
  export type InvestorGroupMemberFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InvestorGroupMember
     */
    select?: InvestorGroupMemberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InvestorGroupMember
     */
    omit?: InvestorGroupMemberOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InvestorGroupMemberInclude<ExtArgs> | null
    /**
     * Filter, which InvestorGroupMember to fetch.
     */
    where?: InvestorGroupMemberWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of InvestorGroupMembers to fetch.
     */
    orderBy?: InvestorGroupMemberOrderByWithRelationInput | InvestorGroupMemberOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for InvestorGroupMembers.
     */
    cursor?: InvestorGroupMemberWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` InvestorGroupMembers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` InvestorGroupMembers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of InvestorGroupMembers.
     */
    distinct?: InvestorGroupMemberScalarFieldEnum | InvestorGroupMemberScalarFieldEnum[]
  }

  /**
   * InvestorGroupMember findMany
   */
  export type InvestorGroupMemberFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InvestorGroupMember
     */
    select?: InvestorGroupMemberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InvestorGroupMember
     */
    omit?: InvestorGroupMemberOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InvestorGroupMemberInclude<ExtArgs> | null
    /**
     * Filter, which InvestorGroupMembers to fetch.
     */
    where?: InvestorGroupMemberWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of InvestorGroupMembers to fetch.
     */
    orderBy?: InvestorGroupMemberOrderByWithRelationInput | InvestorGroupMemberOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing InvestorGroupMembers.
     */
    cursor?: InvestorGroupMemberWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` InvestorGroupMembers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` InvestorGroupMembers.
     */
    skip?: number
    distinct?: InvestorGroupMemberScalarFieldEnum | InvestorGroupMemberScalarFieldEnum[]
  }

  /**
   * InvestorGroupMember create
   */
  export type InvestorGroupMemberCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InvestorGroupMember
     */
    select?: InvestorGroupMemberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InvestorGroupMember
     */
    omit?: InvestorGroupMemberOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InvestorGroupMemberInclude<ExtArgs> | null
    /**
     * The data needed to create a InvestorGroupMember.
     */
    data: XOR<InvestorGroupMemberCreateInput, InvestorGroupMemberUncheckedCreateInput>
  }

  /**
   * InvestorGroupMember createMany
   */
  export type InvestorGroupMemberCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many InvestorGroupMembers.
     */
    data: InvestorGroupMemberCreateManyInput | InvestorGroupMemberCreateManyInput[]
  }

  /**
   * InvestorGroupMember createManyAndReturn
   */
  export type InvestorGroupMemberCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InvestorGroupMember
     */
    select?: InvestorGroupMemberSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the InvestorGroupMember
     */
    omit?: InvestorGroupMemberOmit<ExtArgs> | null
    /**
     * The data used to create many InvestorGroupMembers.
     */
    data: InvestorGroupMemberCreateManyInput | InvestorGroupMemberCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InvestorGroupMemberIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * InvestorGroupMember update
   */
  export type InvestorGroupMemberUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InvestorGroupMember
     */
    select?: InvestorGroupMemberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InvestorGroupMember
     */
    omit?: InvestorGroupMemberOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InvestorGroupMemberInclude<ExtArgs> | null
    /**
     * The data needed to update a InvestorGroupMember.
     */
    data: XOR<InvestorGroupMemberUpdateInput, InvestorGroupMemberUncheckedUpdateInput>
    /**
     * Choose, which InvestorGroupMember to update.
     */
    where: InvestorGroupMemberWhereUniqueInput
  }

  /**
   * InvestorGroupMember updateMany
   */
  export type InvestorGroupMemberUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update InvestorGroupMembers.
     */
    data: XOR<InvestorGroupMemberUpdateManyMutationInput, InvestorGroupMemberUncheckedUpdateManyInput>
    /**
     * Filter which InvestorGroupMembers to update
     */
    where?: InvestorGroupMemberWhereInput
    /**
     * Limit how many InvestorGroupMembers to update.
     */
    limit?: number
  }

  /**
   * InvestorGroupMember updateManyAndReturn
   */
  export type InvestorGroupMemberUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InvestorGroupMember
     */
    select?: InvestorGroupMemberSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the InvestorGroupMember
     */
    omit?: InvestorGroupMemberOmit<ExtArgs> | null
    /**
     * The data used to update InvestorGroupMembers.
     */
    data: XOR<InvestorGroupMemberUpdateManyMutationInput, InvestorGroupMemberUncheckedUpdateManyInput>
    /**
     * Filter which InvestorGroupMembers to update
     */
    where?: InvestorGroupMemberWhereInput
    /**
     * Limit how many InvestorGroupMembers to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InvestorGroupMemberIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * InvestorGroupMember upsert
   */
  export type InvestorGroupMemberUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InvestorGroupMember
     */
    select?: InvestorGroupMemberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InvestorGroupMember
     */
    omit?: InvestorGroupMemberOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InvestorGroupMemberInclude<ExtArgs> | null
    /**
     * The filter to search for the InvestorGroupMember to update in case it exists.
     */
    where: InvestorGroupMemberWhereUniqueInput
    /**
     * In case the InvestorGroupMember found by the `where` argument doesn't exist, create a new InvestorGroupMember with this data.
     */
    create: XOR<InvestorGroupMemberCreateInput, InvestorGroupMemberUncheckedCreateInput>
    /**
     * In case the InvestorGroupMember was found with the provided `where` argument, update it with this data.
     */
    update: XOR<InvestorGroupMemberUpdateInput, InvestorGroupMemberUncheckedUpdateInput>
  }

  /**
   * InvestorGroupMember delete
   */
  export type InvestorGroupMemberDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InvestorGroupMember
     */
    select?: InvestorGroupMemberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InvestorGroupMember
     */
    omit?: InvestorGroupMemberOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InvestorGroupMemberInclude<ExtArgs> | null
    /**
     * Filter which InvestorGroupMember to delete.
     */
    where: InvestorGroupMemberWhereUniqueInput
  }

  /**
   * InvestorGroupMember deleteMany
   */
  export type InvestorGroupMemberDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which InvestorGroupMembers to delete
     */
    where?: InvestorGroupMemberWhereInput
    /**
     * Limit how many InvestorGroupMembers to delete.
     */
    limit?: number
  }

  /**
   * InvestorGroupMember without action
   */
  export type InvestorGroupMemberDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InvestorGroupMember
     */
    select?: InvestorGroupMemberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InvestorGroupMember
     */
    omit?: InvestorGroupMemberOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InvestorGroupMemberInclude<ExtArgs> | null
  }


  /**
   * Model FilmProject
   */

  export type AggregateFilmProject = {
    _count: FilmProjectCountAggregateOutputType | null
    _avg: FilmProjectAvgAggregateOutputType | null
    _sum: FilmProjectSumAggregateOutputType | null
    _min: FilmProjectMinAggregateOutputType | null
    _max: FilmProjectMaxAggregateOutputType | null
  }

  export type FilmProjectAvgAggregateOutputType = {
    totalBudget: number | null
  }

  export type FilmProjectSumAggregateOutputType = {
    totalBudget: number | null
  }

  export type FilmProjectMinAggregateOutputType = {
    id: string | null
    title: string | null
    titleEn: string | null
    genre: string | null
    logline: string | null
    totalBudget: number | null
    budgetBreakdown: string | null
    status: $Enums.ProjectStatus | null
    targetReleaseDate: string | null
    scriptId: string | null
    notes: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type FilmProjectMaxAggregateOutputType = {
    id: string | null
    title: string | null
    titleEn: string | null
    genre: string | null
    logline: string | null
    totalBudget: number | null
    budgetBreakdown: string | null
    status: $Enums.ProjectStatus | null
    targetReleaseDate: string | null
    scriptId: string | null
    notes: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type FilmProjectCountAggregateOutputType = {
    id: number
    title: number
    titleEn: number
    genre: number
    logline: number
    totalBudget: number
    budgetBreakdown: number
    status: number
    targetReleaseDate: number
    scriptId: number
    notes: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type FilmProjectAvgAggregateInputType = {
    totalBudget?: true
  }

  export type FilmProjectSumAggregateInputType = {
    totalBudget?: true
  }

  export type FilmProjectMinAggregateInputType = {
    id?: true
    title?: true
    titleEn?: true
    genre?: true
    logline?: true
    totalBudget?: true
    budgetBreakdown?: true
    status?: true
    targetReleaseDate?: true
    scriptId?: true
    notes?: true
    createdAt?: true
    updatedAt?: true
  }

  export type FilmProjectMaxAggregateInputType = {
    id?: true
    title?: true
    titleEn?: true
    genre?: true
    logline?: true
    totalBudget?: true
    budgetBreakdown?: true
    status?: true
    targetReleaseDate?: true
    scriptId?: true
    notes?: true
    createdAt?: true
    updatedAt?: true
  }

  export type FilmProjectCountAggregateInputType = {
    id?: true
    title?: true
    titleEn?: true
    genre?: true
    logline?: true
    totalBudget?: true
    budgetBreakdown?: true
    status?: true
    targetReleaseDate?: true
    scriptId?: true
    notes?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type FilmProjectAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which FilmProject to aggregate.
     */
    where?: FilmProjectWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FilmProjects to fetch.
     */
    orderBy?: FilmProjectOrderByWithRelationInput | FilmProjectOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: FilmProjectWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FilmProjects from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FilmProjects.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned FilmProjects
    **/
    _count?: true | FilmProjectCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: FilmProjectAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: FilmProjectSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: FilmProjectMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: FilmProjectMaxAggregateInputType
  }

  export type GetFilmProjectAggregateType<T extends FilmProjectAggregateArgs> = {
        [P in keyof T & keyof AggregateFilmProject]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateFilmProject[P]>
      : GetScalarType<T[P], AggregateFilmProject[P]>
  }




  export type FilmProjectGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: FilmProjectWhereInput
    orderBy?: FilmProjectOrderByWithAggregationInput | FilmProjectOrderByWithAggregationInput[]
    by: FilmProjectScalarFieldEnum[] | FilmProjectScalarFieldEnum
    having?: FilmProjectScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: FilmProjectCountAggregateInputType | true
    _avg?: FilmProjectAvgAggregateInputType
    _sum?: FilmProjectSumAggregateInputType
    _min?: FilmProjectMinAggregateInputType
    _max?: FilmProjectMaxAggregateInputType
  }

  export type FilmProjectGroupByOutputType = {
    id: string
    title: string
    titleEn: string | null
    genre: string | null
    logline: string | null
    totalBudget: number | null
    budgetBreakdown: string
    status: $Enums.ProjectStatus
    targetReleaseDate: string | null
    scriptId: string | null
    notes: string | null
    createdAt: Date
    updatedAt: Date
    _count: FilmProjectCountAggregateOutputType | null
    _avg: FilmProjectAvgAggregateOutputType | null
    _sum: FilmProjectSumAggregateOutputType | null
    _min: FilmProjectMinAggregateOutputType | null
    _max: FilmProjectMaxAggregateOutputType | null
  }

  type GetFilmProjectGroupByPayload<T extends FilmProjectGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<FilmProjectGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof FilmProjectGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], FilmProjectGroupByOutputType[P]>
            : GetScalarType<T[P], FilmProjectGroupByOutputType[P]>
        }
      >
    >


  export type FilmProjectSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    titleEn?: boolean
    genre?: boolean
    logline?: boolean
    totalBudget?: boolean
    budgetBreakdown?: boolean
    status?: boolean
    targetReleaseDate?: boolean
    scriptId?: boolean
    notes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    spcs?: boolean | FilmProject$spcsArgs<ExtArgs>
    _count?: boolean | FilmProjectCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["filmProject"]>

  export type FilmProjectSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    titleEn?: boolean
    genre?: boolean
    logline?: boolean
    totalBudget?: boolean
    budgetBreakdown?: boolean
    status?: boolean
    targetReleaseDate?: boolean
    scriptId?: boolean
    notes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["filmProject"]>

  export type FilmProjectSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    titleEn?: boolean
    genre?: boolean
    logline?: boolean
    totalBudget?: boolean
    budgetBreakdown?: boolean
    status?: boolean
    targetReleaseDate?: boolean
    scriptId?: boolean
    notes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["filmProject"]>

  export type FilmProjectSelectScalar = {
    id?: boolean
    title?: boolean
    titleEn?: boolean
    genre?: boolean
    logline?: boolean
    totalBudget?: boolean
    budgetBreakdown?: boolean
    status?: boolean
    targetReleaseDate?: boolean
    scriptId?: boolean
    notes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type FilmProjectOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "title" | "titleEn" | "genre" | "logline" | "totalBudget" | "budgetBreakdown" | "status" | "targetReleaseDate" | "scriptId" | "notes" | "createdAt" | "updatedAt", ExtArgs["result"]["filmProject"]>
  export type FilmProjectInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    spcs?: boolean | FilmProject$spcsArgs<ExtArgs>
    _count?: boolean | FilmProjectCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type FilmProjectIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type FilmProjectIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $FilmProjectPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "FilmProject"
    objects: {
      spcs: Prisma.$SPCPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      title: string
      titleEn: string | null
      genre: string | null
      logline: string | null
      /**
       * 총 제작비 (만원)
       */
      totalBudget: number | null
      /**
       * 제작비 구성 JSON: { "pre": 5000, "main": 30000, "post": 10000, "marketing": 5000 }
       */
      budgetBreakdown: string
      status: $Enums.ProjectStatus
      /**
       * ISO date string
       */
      targetReleaseDate: string | null
      /**
       * scenario-db의 스크립트 ID 연결 (optional cross-package reference)
       */
      scriptId: string | null
      notes: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["filmProject"]>
    composites: {}
  }

  type FilmProjectGetPayload<S extends boolean | null | undefined | FilmProjectDefaultArgs> = $Result.GetResult<Prisma.$FilmProjectPayload, S>

  type FilmProjectCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<FilmProjectFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: FilmProjectCountAggregateInputType | true
    }

  export interface FilmProjectDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['FilmProject'], meta: { name: 'FilmProject' } }
    /**
     * Find zero or one FilmProject that matches the filter.
     * @param {FilmProjectFindUniqueArgs} args - Arguments to find a FilmProject
     * @example
     * // Get one FilmProject
     * const filmProject = await prisma.filmProject.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends FilmProjectFindUniqueArgs>(args: SelectSubset<T, FilmProjectFindUniqueArgs<ExtArgs>>): Prisma__FilmProjectClient<$Result.GetResult<Prisma.$FilmProjectPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one FilmProject that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {FilmProjectFindUniqueOrThrowArgs} args - Arguments to find a FilmProject
     * @example
     * // Get one FilmProject
     * const filmProject = await prisma.filmProject.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends FilmProjectFindUniqueOrThrowArgs>(args: SelectSubset<T, FilmProjectFindUniqueOrThrowArgs<ExtArgs>>): Prisma__FilmProjectClient<$Result.GetResult<Prisma.$FilmProjectPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first FilmProject that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FilmProjectFindFirstArgs} args - Arguments to find a FilmProject
     * @example
     * // Get one FilmProject
     * const filmProject = await prisma.filmProject.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends FilmProjectFindFirstArgs>(args?: SelectSubset<T, FilmProjectFindFirstArgs<ExtArgs>>): Prisma__FilmProjectClient<$Result.GetResult<Prisma.$FilmProjectPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first FilmProject that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FilmProjectFindFirstOrThrowArgs} args - Arguments to find a FilmProject
     * @example
     * // Get one FilmProject
     * const filmProject = await prisma.filmProject.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends FilmProjectFindFirstOrThrowArgs>(args?: SelectSubset<T, FilmProjectFindFirstOrThrowArgs<ExtArgs>>): Prisma__FilmProjectClient<$Result.GetResult<Prisma.$FilmProjectPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more FilmProjects that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FilmProjectFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all FilmProjects
     * const filmProjects = await prisma.filmProject.findMany()
     * 
     * // Get first 10 FilmProjects
     * const filmProjects = await prisma.filmProject.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const filmProjectWithIdOnly = await prisma.filmProject.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends FilmProjectFindManyArgs>(args?: SelectSubset<T, FilmProjectFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FilmProjectPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a FilmProject.
     * @param {FilmProjectCreateArgs} args - Arguments to create a FilmProject.
     * @example
     * // Create one FilmProject
     * const FilmProject = await prisma.filmProject.create({
     *   data: {
     *     // ... data to create a FilmProject
     *   }
     * })
     * 
     */
    create<T extends FilmProjectCreateArgs>(args: SelectSubset<T, FilmProjectCreateArgs<ExtArgs>>): Prisma__FilmProjectClient<$Result.GetResult<Prisma.$FilmProjectPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many FilmProjects.
     * @param {FilmProjectCreateManyArgs} args - Arguments to create many FilmProjects.
     * @example
     * // Create many FilmProjects
     * const filmProject = await prisma.filmProject.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends FilmProjectCreateManyArgs>(args?: SelectSubset<T, FilmProjectCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many FilmProjects and returns the data saved in the database.
     * @param {FilmProjectCreateManyAndReturnArgs} args - Arguments to create many FilmProjects.
     * @example
     * // Create many FilmProjects
     * const filmProject = await prisma.filmProject.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many FilmProjects and only return the `id`
     * const filmProjectWithIdOnly = await prisma.filmProject.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends FilmProjectCreateManyAndReturnArgs>(args?: SelectSubset<T, FilmProjectCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FilmProjectPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a FilmProject.
     * @param {FilmProjectDeleteArgs} args - Arguments to delete one FilmProject.
     * @example
     * // Delete one FilmProject
     * const FilmProject = await prisma.filmProject.delete({
     *   where: {
     *     // ... filter to delete one FilmProject
     *   }
     * })
     * 
     */
    delete<T extends FilmProjectDeleteArgs>(args: SelectSubset<T, FilmProjectDeleteArgs<ExtArgs>>): Prisma__FilmProjectClient<$Result.GetResult<Prisma.$FilmProjectPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one FilmProject.
     * @param {FilmProjectUpdateArgs} args - Arguments to update one FilmProject.
     * @example
     * // Update one FilmProject
     * const filmProject = await prisma.filmProject.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends FilmProjectUpdateArgs>(args: SelectSubset<T, FilmProjectUpdateArgs<ExtArgs>>): Prisma__FilmProjectClient<$Result.GetResult<Prisma.$FilmProjectPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more FilmProjects.
     * @param {FilmProjectDeleteManyArgs} args - Arguments to filter FilmProjects to delete.
     * @example
     * // Delete a few FilmProjects
     * const { count } = await prisma.filmProject.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends FilmProjectDeleteManyArgs>(args?: SelectSubset<T, FilmProjectDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more FilmProjects.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FilmProjectUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many FilmProjects
     * const filmProject = await prisma.filmProject.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends FilmProjectUpdateManyArgs>(args: SelectSubset<T, FilmProjectUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more FilmProjects and returns the data updated in the database.
     * @param {FilmProjectUpdateManyAndReturnArgs} args - Arguments to update many FilmProjects.
     * @example
     * // Update many FilmProjects
     * const filmProject = await prisma.filmProject.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more FilmProjects and only return the `id`
     * const filmProjectWithIdOnly = await prisma.filmProject.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends FilmProjectUpdateManyAndReturnArgs>(args: SelectSubset<T, FilmProjectUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FilmProjectPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one FilmProject.
     * @param {FilmProjectUpsertArgs} args - Arguments to update or create a FilmProject.
     * @example
     * // Update or create a FilmProject
     * const filmProject = await prisma.filmProject.upsert({
     *   create: {
     *     // ... data to create a FilmProject
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the FilmProject we want to update
     *   }
     * })
     */
    upsert<T extends FilmProjectUpsertArgs>(args: SelectSubset<T, FilmProjectUpsertArgs<ExtArgs>>): Prisma__FilmProjectClient<$Result.GetResult<Prisma.$FilmProjectPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of FilmProjects.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FilmProjectCountArgs} args - Arguments to filter FilmProjects to count.
     * @example
     * // Count the number of FilmProjects
     * const count = await prisma.filmProject.count({
     *   where: {
     *     // ... the filter for the FilmProjects we want to count
     *   }
     * })
    **/
    count<T extends FilmProjectCountArgs>(
      args?: Subset<T, FilmProjectCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], FilmProjectCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a FilmProject.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FilmProjectAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends FilmProjectAggregateArgs>(args: Subset<T, FilmProjectAggregateArgs>): Prisma.PrismaPromise<GetFilmProjectAggregateType<T>>

    /**
     * Group by FilmProject.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FilmProjectGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends FilmProjectGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: FilmProjectGroupByArgs['orderBy'] }
        : { orderBy?: FilmProjectGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, FilmProjectGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetFilmProjectGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the FilmProject model
   */
  readonly fields: FilmProjectFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for FilmProject.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__FilmProjectClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    spcs<T extends FilmProject$spcsArgs<ExtArgs> = {}>(args?: Subset<T, FilmProject$spcsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SPCPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the FilmProject model
   */
  interface FilmProjectFieldRefs {
    readonly id: FieldRef<"FilmProject", 'String'>
    readonly title: FieldRef<"FilmProject", 'String'>
    readonly titleEn: FieldRef<"FilmProject", 'String'>
    readonly genre: FieldRef<"FilmProject", 'String'>
    readonly logline: FieldRef<"FilmProject", 'String'>
    readonly totalBudget: FieldRef<"FilmProject", 'Int'>
    readonly budgetBreakdown: FieldRef<"FilmProject", 'String'>
    readonly status: FieldRef<"FilmProject", 'ProjectStatus'>
    readonly targetReleaseDate: FieldRef<"FilmProject", 'String'>
    readonly scriptId: FieldRef<"FilmProject", 'String'>
    readonly notes: FieldRef<"FilmProject", 'String'>
    readonly createdAt: FieldRef<"FilmProject", 'DateTime'>
    readonly updatedAt: FieldRef<"FilmProject", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * FilmProject findUnique
   */
  export type FilmProjectFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FilmProject
     */
    select?: FilmProjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FilmProject
     */
    omit?: FilmProjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FilmProjectInclude<ExtArgs> | null
    /**
     * Filter, which FilmProject to fetch.
     */
    where: FilmProjectWhereUniqueInput
  }

  /**
   * FilmProject findUniqueOrThrow
   */
  export type FilmProjectFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FilmProject
     */
    select?: FilmProjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FilmProject
     */
    omit?: FilmProjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FilmProjectInclude<ExtArgs> | null
    /**
     * Filter, which FilmProject to fetch.
     */
    where: FilmProjectWhereUniqueInput
  }

  /**
   * FilmProject findFirst
   */
  export type FilmProjectFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FilmProject
     */
    select?: FilmProjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FilmProject
     */
    omit?: FilmProjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FilmProjectInclude<ExtArgs> | null
    /**
     * Filter, which FilmProject to fetch.
     */
    where?: FilmProjectWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FilmProjects to fetch.
     */
    orderBy?: FilmProjectOrderByWithRelationInput | FilmProjectOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for FilmProjects.
     */
    cursor?: FilmProjectWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FilmProjects from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FilmProjects.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of FilmProjects.
     */
    distinct?: FilmProjectScalarFieldEnum | FilmProjectScalarFieldEnum[]
  }

  /**
   * FilmProject findFirstOrThrow
   */
  export type FilmProjectFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FilmProject
     */
    select?: FilmProjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FilmProject
     */
    omit?: FilmProjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FilmProjectInclude<ExtArgs> | null
    /**
     * Filter, which FilmProject to fetch.
     */
    where?: FilmProjectWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FilmProjects to fetch.
     */
    orderBy?: FilmProjectOrderByWithRelationInput | FilmProjectOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for FilmProjects.
     */
    cursor?: FilmProjectWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FilmProjects from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FilmProjects.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of FilmProjects.
     */
    distinct?: FilmProjectScalarFieldEnum | FilmProjectScalarFieldEnum[]
  }

  /**
   * FilmProject findMany
   */
  export type FilmProjectFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FilmProject
     */
    select?: FilmProjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FilmProject
     */
    omit?: FilmProjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FilmProjectInclude<ExtArgs> | null
    /**
     * Filter, which FilmProjects to fetch.
     */
    where?: FilmProjectWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FilmProjects to fetch.
     */
    orderBy?: FilmProjectOrderByWithRelationInput | FilmProjectOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing FilmProjects.
     */
    cursor?: FilmProjectWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FilmProjects from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FilmProjects.
     */
    skip?: number
    distinct?: FilmProjectScalarFieldEnum | FilmProjectScalarFieldEnum[]
  }

  /**
   * FilmProject create
   */
  export type FilmProjectCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FilmProject
     */
    select?: FilmProjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FilmProject
     */
    omit?: FilmProjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FilmProjectInclude<ExtArgs> | null
    /**
     * The data needed to create a FilmProject.
     */
    data: XOR<FilmProjectCreateInput, FilmProjectUncheckedCreateInput>
  }

  /**
   * FilmProject createMany
   */
  export type FilmProjectCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many FilmProjects.
     */
    data: FilmProjectCreateManyInput | FilmProjectCreateManyInput[]
  }

  /**
   * FilmProject createManyAndReturn
   */
  export type FilmProjectCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FilmProject
     */
    select?: FilmProjectSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the FilmProject
     */
    omit?: FilmProjectOmit<ExtArgs> | null
    /**
     * The data used to create many FilmProjects.
     */
    data: FilmProjectCreateManyInput | FilmProjectCreateManyInput[]
  }

  /**
   * FilmProject update
   */
  export type FilmProjectUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FilmProject
     */
    select?: FilmProjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FilmProject
     */
    omit?: FilmProjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FilmProjectInclude<ExtArgs> | null
    /**
     * The data needed to update a FilmProject.
     */
    data: XOR<FilmProjectUpdateInput, FilmProjectUncheckedUpdateInput>
    /**
     * Choose, which FilmProject to update.
     */
    where: FilmProjectWhereUniqueInput
  }

  /**
   * FilmProject updateMany
   */
  export type FilmProjectUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update FilmProjects.
     */
    data: XOR<FilmProjectUpdateManyMutationInput, FilmProjectUncheckedUpdateManyInput>
    /**
     * Filter which FilmProjects to update
     */
    where?: FilmProjectWhereInput
    /**
     * Limit how many FilmProjects to update.
     */
    limit?: number
  }

  /**
   * FilmProject updateManyAndReturn
   */
  export type FilmProjectUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FilmProject
     */
    select?: FilmProjectSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the FilmProject
     */
    omit?: FilmProjectOmit<ExtArgs> | null
    /**
     * The data used to update FilmProjects.
     */
    data: XOR<FilmProjectUpdateManyMutationInput, FilmProjectUncheckedUpdateManyInput>
    /**
     * Filter which FilmProjects to update
     */
    where?: FilmProjectWhereInput
    /**
     * Limit how many FilmProjects to update.
     */
    limit?: number
  }

  /**
   * FilmProject upsert
   */
  export type FilmProjectUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FilmProject
     */
    select?: FilmProjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FilmProject
     */
    omit?: FilmProjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FilmProjectInclude<ExtArgs> | null
    /**
     * The filter to search for the FilmProject to update in case it exists.
     */
    where: FilmProjectWhereUniqueInput
    /**
     * In case the FilmProject found by the `where` argument doesn't exist, create a new FilmProject with this data.
     */
    create: XOR<FilmProjectCreateInput, FilmProjectUncheckedCreateInput>
    /**
     * In case the FilmProject was found with the provided `where` argument, update it with this data.
     */
    update: XOR<FilmProjectUpdateInput, FilmProjectUncheckedUpdateInput>
  }

  /**
   * FilmProject delete
   */
  export type FilmProjectDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FilmProject
     */
    select?: FilmProjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FilmProject
     */
    omit?: FilmProjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FilmProjectInclude<ExtArgs> | null
    /**
     * Filter which FilmProject to delete.
     */
    where: FilmProjectWhereUniqueInput
  }

  /**
   * FilmProject deleteMany
   */
  export type FilmProjectDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which FilmProjects to delete
     */
    where?: FilmProjectWhereInput
    /**
     * Limit how many FilmProjects to delete.
     */
    limit?: number
  }

  /**
   * FilmProject.spcs
   */
  export type FilmProject$spcsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SPC
     */
    select?: SPCSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SPC
     */
    omit?: SPCOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SPCInclude<ExtArgs> | null
    where?: SPCWhereInput
    orderBy?: SPCOrderByWithRelationInput | SPCOrderByWithRelationInput[]
    cursor?: SPCWhereUniqueInput
    take?: number
    skip?: number
    distinct?: SPCScalarFieldEnum | SPCScalarFieldEnum[]
  }

  /**
   * FilmProject without action
   */
  export type FilmProjectDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FilmProject
     */
    select?: FilmProjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FilmProject
     */
    omit?: FilmProjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FilmProjectInclude<ExtArgs> | null
  }


  /**
   * Model SPC
   */

  export type AggregateSPC = {
    _count: SPCCountAggregateOutputType | null
    _avg: SPCAvgAggregateOutputType | null
    _sum: SPCSumAggregateOutputType | null
    _min: SPCMinAggregateOutputType | null
    _max: SPCMaxAggregateOutputType | null
  }

  export type SPCAvgAggregateOutputType = {
    totalCapital: number | null
    totalBudget: number | null
    raisedAmount: number | null
  }

  export type SPCSumAggregateOutputType = {
    totalCapital: number | null
    totalBudget: number | null
    raisedAmount: number | null
  }

  export type SPCMinAggregateOutputType = {
    id: string | null
    projectId: string | null
    name: string | null
    legalType: $Enums.SPCLegalType | null
    registrationNumber: string | null
    incorporationDate: string | null
    totalCapital: number | null
    totalBudget: number | null
    raisedAmount: number | null
    status: $Enums.SPCStatus | null
    notes: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type SPCMaxAggregateOutputType = {
    id: string | null
    projectId: string | null
    name: string | null
    legalType: $Enums.SPCLegalType | null
    registrationNumber: string | null
    incorporationDate: string | null
    totalCapital: number | null
    totalBudget: number | null
    raisedAmount: number | null
    status: $Enums.SPCStatus | null
    notes: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type SPCCountAggregateOutputType = {
    id: number
    projectId: number
    name: number
    legalType: number
    registrationNumber: number
    incorporationDate: number
    totalCapital: number
    totalBudget: number
    raisedAmount: number
    status: number
    notes: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type SPCAvgAggregateInputType = {
    totalCapital?: true
    totalBudget?: true
    raisedAmount?: true
  }

  export type SPCSumAggregateInputType = {
    totalCapital?: true
    totalBudget?: true
    raisedAmount?: true
  }

  export type SPCMinAggregateInputType = {
    id?: true
    projectId?: true
    name?: true
    legalType?: true
    registrationNumber?: true
    incorporationDate?: true
    totalCapital?: true
    totalBudget?: true
    raisedAmount?: true
    status?: true
    notes?: true
    createdAt?: true
    updatedAt?: true
  }

  export type SPCMaxAggregateInputType = {
    id?: true
    projectId?: true
    name?: true
    legalType?: true
    registrationNumber?: true
    incorporationDate?: true
    totalCapital?: true
    totalBudget?: true
    raisedAmount?: true
    status?: true
    notes?: true
    createdAt?: true
    updatedAt?: true
  }

  export type SPCCountAggregateInputType = {
    id?: true
    projectId?: true
    name?: true
    legalType?: true
    registrationNumber?: true
    incorporationDate?: true
    totalCapital?: true
    totalBudget?: true
    raisedAmount?: true
    status?: true
    notes?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type SPCAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SPC to aggregate.
     */
    where?: SPCWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SPCS to fetch.
     */
    orderBy?: SPCOrderByWithRelationInput | SPCOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SPCWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SPCS from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SPCS.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned SPCS
    **/
    _count?: true | SPCCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: SPCAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: SPCSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SPCMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SPCMaxAggregateInputType
  }

  export type GetSPCAggregateType<T extends SPCAggregateArgs> = {
        [P in keyof T & keyof AggregateSPC]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSPC[P]>
      : GetScalarType<T[P], AggregateSPC[P]>
  }




  export type SPCGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SPCWhereInput
    orderBy?: SPCOrderByWithAggregationInput | SPCOrderByWithAggregationInput[]
    by: SPCScalarFieldEnum[] | SPCScalarFieldEnum
    having?: SPCScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SPCCountAggregateInputType | true
    _avg?: SPCAvgAggregateInputType
    _sum?: SPCSumAggregateInputType
    _min?: SPCMinAggregateInputType
    _max?: SPCMaxAggregateInputType
  }

  export type SPCGroupByOutputType = {
    id: string
    projectId: string
    name: string
    legalType: $Enums.SPCLegalType
    registrationNumber: string | null
    incorporationDate: string | null
    totalCapital: number | null
    totalBudget: number | null
    raisedAmount: number
    status: $Enums.SPCStatus
    notes: string | null
    createdAt: Date
    updatedAt: Date
    _count: SPCCountAggregateOutputType | null
    _avg: SPCAvgAggregateOutputType | null
    _sum: SPCSumAggregateOutputType | null
    _min: SPCMinAggregateOutputType | null
    _max: SPCMaxAggregateOutputType | null
  }

  type GetSPCGroupByPayload<T extends SPCGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SPCGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SPCGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SPCGroupByOutputType[P]>
            : GetScalarType<T[P], SPCGroupByOutputType[P]>
        }
      >
    >


  export type SPCSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    projectId?: boolean
    name?: boolean
    legalType?: boolean
    registrationNumber?: boolean
    incorporationDate?: boolean
    totalCapital?: boolean
    totalBudget?: boolean
    raisedAmount?: boolean
    status?: boolean
    notes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    project?: boolean | FilmProjectDefaultArgs<ExtArgs>
    tranches?: boolean | SPC$tranchesArgs<ExtArgs>
    waterfallTiers?: boolean | SPC$waterfallTiersArgs<ExtArgs>
    revenueEvents?: boolean | SPC$revenueEventsArgs<ExtArgs>
    _count?: boolean | SPCCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["sPC"]>

  export type SPCSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    projectId?: boolean
    name?: boolean
    legalType?: boolean
    registrationNumber?: boolean
    incorporationDate?: boolean
    totalCapital?: boolean
    totalBudget?: boolean
    raisedAmount?: boolean
    status?: boolean
    notes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    project?: boolean | FilmProjectDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["sPC"]>

  export type SPCSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    projectId?: boolean
    name?: boolean
    legalType?: boolean
    registrationNumber?: boolean
    incorporationDate?: boolean
    totalCapital?: boolean
    totalBudget?: boolean
    raisedAmount?: boolean
    status?: boolean
    notes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    project?: boolean | FilmProjectDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["sPC"]>

  export type SPCSelectScalar = {
    id?: boolean
    projectId?: boolean
    name?: boolean
    legalType?: boolean
    registrationNumber?: boolean
    incorporationDate?: boolean
    totalCapital?: boolean
    totalBudget?: boolean
    raisedAmount?: boolean
    status?: boolean
    notes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type SPCOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "projectId" | "name" | "legalType" | "registrationNumber" | "incorporationDate" | "totalCapital" | "totalBudget" | "raisedAmount" | "status" | "notes" | "createdAt" | "updatedAt", ExtArgs["result"]["sPC"]>
  export type SPCInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    project?: boolean | FilmProjectDefaultArgs<ExtArgs>
    tranches?: boolean | SPC$tranchesArgs<ExtArgs>
    waterfallTiers?: boolean | SPC$waterfallTiersArgs<ExtArgs>
    revenueEvents?: boolean | SPC$revenueEventsArgs<ExtArgs>
    _count?: boolean | SPCCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type SPCIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    project?: boolean | FilmProjectDefaultArgs<ExtArgs>
  }
  export type SPCIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    project?: boolean | FilmProjectDefaultArgs<ExtArgs>
  }

  export type $SPCPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "SPC"
    objects: {
      project: Prisma.$FilmProjectPayload<ExtArgs>
      tranches: Prisma.$PFTranchePayload<ExtArgs>[]
      waterfallTiers: Prisma.$WaterfallTierPayload<ExtArgs>[]
      revenueEvents: Prisma.$RevenueEventPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      projectId: string
      name: string
      /**
       * 주식회사 | 유한회사 | 유한책임회사
       */
      legalType: $Enums.SPCLegalType
      registrationNumber: string | null
      incorporationDate: string | null
      /**
       * 자본금 (만원)
       */
      totalCapital: number | null
      /**
       * 총 조달 목표액 (만원) — 자본금 + 대출
       */
      totalBudget: number | null
      /**
       * 현재 조달 완료액 (만원)
       */
      raisedAmount: number
      status: $Enums.SPCStatus
      notes: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["sPC"]>
    composites: {}
  }

  type SPCGetPayload<S extends boolean | null | undefined | SPCDefaultArgs> = $Result.GetResult<Prisma.$SPCPayload, S>

  type SPCCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<SPCFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: SPCCountAggregateInputType | true
    }

  export interface SPCDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['SPC'], meta: { name: 'SPC' } }
    /**
     * Find zero or one SPC that matches the filter.
     * @param {SPCFindUniqueArgs} args - Arguments to find a SPC
     * @example
     * // Get one SPC
     * const sPC = await prisma.sPC.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SPCFindUniqueArgs>(args: SelectSubset<T, SPCFindUniqueArgs<ExtArgs>>): Prisma__SPCClient<$Result.GetResult<Prisma.$SPCPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one SPC that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {SPCFindUniqueOrThrowArgs} args - Arguments to find a SPC
     * @example
     * // Get one SPC
     * const sPC = await prisma.sPC.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SPCFindUniqueOrThrowArgs>(args: SelectSubset<T, SPCFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SPCClient<$Result.GetResult<Prisma.$SPCPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first SPC that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SPCFindFirstArgs} args - Arguments to find a SPC
     * @example
     * // Get one SPC
     * const sPC = await prisma.sPC.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SPCFindFirstArgs>(args?: SelectSubset<T, SPCFindFirstArgs<ExtArgs>>): Prisma__SPCClient<$Result.GetResult<Prisma.$SPCPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first SPC that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SPCFindFirstOrThrowArgs} args - Arguments to find a SPC
     * @example
     * // Get one SPC
     * const sPC = await prisma.sPC.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SPCFindFirstOrThrowArgs>(args?: SelectSubset<T, SPCFindFirstOrThrowArgs<ExtArgs>>): Prisma__SPCClient<$Result.GetResult<Prisma.$SPCPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more SPCS that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SPCFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all SPCS
     * const sPCS = await prisma.sPC.findMany()
     * 
     * // Get first 10 SPCS
     * const sPCS = await prisma.sPC.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const sPCWithIdOnly = await prisma.sPC.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SPCFindManyArgs>(args?: SelectSubset<T, SPCFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SPCPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a SPC.
     * @param {SPCCreateArgs} args - Arguments to create a SPC.
     * @example
     * // Create one SPC
     * const SPC = await prisma.sPC.create({
     *   data: {
     *     // ... data to create a SPC
     *   }
     * })
     * 
     */
    create<T extends SPCCreateArgs>(args: SelectSubset<T, SPCCreateArgs<ExtArgs>>): Prisma__SPCClient<$Result.GetResult<Prisma.$SPCPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many SPCS.
     * @param {SPCCreateManyArgs} args - Arguments to create many SPCS.
     * @example
     * // Create many SPCS
     * const sPC = await prisma.sPC.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SPCCreateManyArgs>(args?: SelectSubset<T, SPCCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many SPCS and returns the data saved in the database.
     * @param {SPCCreateManyAndReturnArgs} args - Arguments to create many SPCS.
     * @example
     * // Create many SPCS
     * const sPC = await prisma.sPC.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many SPCS and only return the `id`
     * const sPCWithIdOnly = await prisma.sPC.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SPCCreateManyAndReturnArgs>(args?: SelectSubset<T, SPCCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SPCPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a SPC.
     * @param {SPCDeleteArgs} args - Arguments to delete one SPC.
     * @example
     * // Delete one SPC
     * const SPC = await prisma.sPC.delete({
     *   where: {
     *     // ... filter to delete one SPC
     *   }
     * })
     * 
     */
    delete<T extends SPCDeleteArgs>(args: SelectSubset<T, SPCDeleteArgs<ExtArgs>>): Prisma__SPCClient<$Result.GetResult<Prisma.$SPCPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one SPC.
     * @param {SPCUpdateArgs} args - Arguments to update one SPC.
     * @example
     * // Update one SPC
     * const sPC = await prisma.sPC.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SPCUpdateArgs>(args: SelectSubset<T, SPCUpdateArgs<ExtArgs>>): Prisma__SPCClient<$Result.GetResult<Prisma.$SPCPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more SPCS.
     * @param {SPCDeleteManyArgs} args - Arguments to filter SPCS to delete.
     * @example
     * // Delete a few SPCS
     * const { count } = await prisma.sPC.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SPCDeleteManyArgs>(args?: SelectSubset<T, SPCDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SPCS.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SPCUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many SPCS
     * const sPC = await prisma.sPC.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SPCUpdateManyArgs>(args: SelectSubset<T, SPCUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SPCS and returns the data updated in the database.
     * @param {SPCUpdateManyAndReturnArgs} args - Arguments to update many SPCS.
     * @example
     * // Update many SPCS
     * const sPC = await prisma.sPC.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more SPCS and only return the `id`
     * const sPCWithIdOnly = await prisma.sPC.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends SPCUpdateManyAndReturnArgs>(args: SelectSubset<T, SPCUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SPCPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one SPC.
     * @param {SPCUpsertArgs} args - Arguments to update or create a SPC.
     * @example
     * // Update or create a SPC
     * const sPC = await prisma.sPC.upsert({
     *   create: {
     *     // ... data to create a SPC
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the SPC we want to update
     *   }
     * })
     */
    upsert<T extends SPCUpsertArgs>(args: SelectSubset<T, SPCUpsertArgs<ExtArgs>>): Prisma__SPCClient<$Result.GetResult<Prisma.$SPCPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of SPCS.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SPCCountArgs} args - Arguments to filter SPCS to count.
     * @example
     * // Count the number of SPCS
     * const count = await prisma.sPC.count({
     *   where: {
     *     // ... the filter for the SPCS we want to count
     *   }
     * })
    **/
    count<T extends SPCCountArgs>(
      args?: Subset<T, SPCCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SPCCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a SPC.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SPCAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SPCAggregateArgs>(args: Subset<T, SPCAggregateArgs>): Prisma.PrismaPromise<GetSPCAggregateType<T>>

    /**
     * Group by SPC.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SPCGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SPCGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SPCGroupByArgs['orderBy'] }
        : { orderBy?: SPCGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SPCGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSPCGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the SPC model
   */
  readonly fields: SPCFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for SPC.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SPCClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    project<T extends FilmProjectDefaultArgs<ExtArgs> = {}>(args?: Subset<T, FilmProjectDefaultArgs<ExtArgs>>): Prisma__FilmProjectClient<$Result.GetResult<Prisma.$FilmProjectPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    tranches<T extends SPC$tranchesArgs<ExtArgs> = {}>(args?: Subset<T, SPC$tranchesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PFTranchePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    waterfallTiers<T extends SPC$waterfallTiersArgs<ExtArgs> = {}>(args?: Subset<T, SPC$waterfallTiersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WaterfallTierPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    revenueEvents<T extends SPC$revenueEventsArgs<ExtArgs> = {}>(args?: Subset<T, SPC$revenueEventsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RevenueEventPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the SPC model
   */
  interface SPCFieldRefs {
    readonly id: FieldRef<"SPC", 'String'>
    readonly projectId: FieldRef<"SPC", 'String'>
    readonly name: FieldRef<"SPC", 'String'>
    readonly legalType: FieldRef<"SPC", 'SPCLegalType'>
    readonly registrationNumber: FieldRef<"SPC", 'String'>
    readonly incorporationDate: FieldRef<"SPC", 'String'>
    readonly totalCapital: FieldRef<"SPC", 'Int'>
    readonly totalBudget: FieldRef<"SPC", 'Int'>
    readonly raisedAmount: FieldRef<"SPC", 'Int'>
    readonly status: FieldRef<"SPC", 'SPCStatus'>
    readonly notes: FieldRef<"SPC", 'String'>
    readonly createdAt: FieldRef<"SPC", 'DateTime'>
    readonly updatedAt: FieldRef<"SPC", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * SPC findUnique
   */
  export type SPCFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SPC
     */
    select?: SPCSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SPC
     */
    omit?: SPCOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SPCInclude<ExtArgs> | null
    /**
     * Filter, which SPC to fetch.
     */
    where: SPCWhereUniqueInput
  }

  /**
   * SPC findUniqueOrThrow
   */
  export type SPCFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SPC
     */
    select?: SPCSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SPC
     */
    omit?: SPCOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SPCInclude<ExtArgs> | null
    /**
     * Filter, which SPC to fetch.
     */
    where: SPCWhereUniqueInput
  }

  /**
   * SPC findFirst
   */
  export type SPCFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SPC
     */
    select?: SPCSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SPC
     */
    omit?: SPCOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SPCInclude<ExtArgs> | null
    /**
     * Filter, which SPC to fetch.
     */
    where?: SPCWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SPCS to fetch.
     */
    orderBy?: SPCOrderByWithRelationInput | SPCOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SPCS.
     */
    cursor?: SPCWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SPCS from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SPCS.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SPCS.
     */
    distinct?: SPCScalarFieldEnum | SPCScalarFieldEnum[]
  }

  /**
   * SPC findFirstOrThrow
   */
  export type SPCFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SPC
     */
    select?: SPCSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SPC
     */
    omit?: SPCOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SPCInclude<ExtArgs> | null
    /**
     * Filter, which SPC to fetch.
     */
    where?: SPCWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SPCS to fetch.
     */
    orderBy?: SPCOrderByWithRelationInput | SPCOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SPCS.
     */
    cursor?: SPCWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SPCS from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SPCS.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SPCS.
     */
    distinct?: SPCScalarFieldEnum | SPCScalarFieldEnum[]
  }

  /**
   * SPC findMany
   */
  export type SPCFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SPC
     */
    select?: SPCSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SPC
     */
    omit?: SPCOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SPCInclude<ExtArgs> | null
    /**
     * Filter, which SPCS to fetch.
     */
    where?: SPCWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SPCS to fetch.
     */
    orderBy?: SPCOrderByWithRelationInput | SPCOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing SPCS.
     */
    cursor?: SPCWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SPCS from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SPCS.
     */
    skip?: number
    distinct?: SPCScalarFieldEnum | SPCScalarFieldEnum[]
  }

  /**
   * SPC create
   */
  export type SPCCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SPC
     */
    select?: SPCSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SPC
     */
    omit?: SPCOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SPCInclude<ExtArgs> | null
    /**
     * The data needed to create a SPC.
     */
    data: XOR<SPCCreateInput, SPCUncheckedCreateInput>
  }

  /**
   * SPC createMany
   */
  export type SPCCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many SPCS.
     */
    data: SPCCreateManyInput | SPCCreateManyInput[]
  }

  /**
   * SPC createManyAndReturn
   */
  export type SPCCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SPC
     */
    select?: SPCSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the SPC
     */
    omit?: SPCOmit<ExtArgs> | null
    /**
     * The data used to create many SPCS.
     */
    data: SPCCreateManyInput | SPCCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SPCIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * SPC update
   */
  export type SPCUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SPC
     */
    select?: SPCSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SPC
     */
    omit?: SPCOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SPCInclude<ExtArgs> | null
    /**
     * The data needed to update a SPC.
     */
    data: XOR<SPCUpdateInput, SPCUncheckedUpdateInput>
    /**
     * Choose, which SPC to update.
     */
    where: SPCWhereUniqueInput
  }

  /**
   * SPC updateMany
   */
  export type SPCUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update SPCS.
     */
    data: XOR<SPCUpdateManyMutationInput, SPCUncheckedUpdateManyInput>
    /**
     * Filter which SPCS to update
     */
    where?: SPCWhereInput
    /**
     * Limit how many SPCS to update.
     */
    limit?: number
  }

  /**
   * SPC updateManyAndReturn
   */
  export type SPCUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SPC
     */
    select?: SPCSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the SPC
     */
    omit?: SPCOmit<ExtArgs> | null
    /**
     * The data used to update SPCS.
     */
    data: XOR<SPCUpdateManyMutationInput, SPCUncheckedUpdateManyInput>
    /**
     * Filter which SPCS to update
     */
    where?: SPCWhereInput
    /**
     * Limit how many SPCS to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SPCIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * SPC upsert
   */
  export type SPCUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SPC
     */
    select?: SPCSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SPC
     */
    omit?: SPCOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SPCInclude<ExtArgs> | null
    /**
     * The filter to search for the SPC to update in case it exists.
     */
    where: SPCWhereUniqueInput
    /**
     * In case the SPC found by the `where` argument doesn't exist, create a new SPC with this data.
     */
    create: XOR<SPCCreateInput, SPCUncheckedCreateInput>
    /**
     * In case the SPC was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SPCUpdateInput, SPCUncheckedUpdateInput>
  }

  /**
   * SPC delete
   */
  export type SPCDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SPC
     */
    select?: SPCSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SPC
     */
    omit?: SPCOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SPCInclude<ExtArgs> | null
    /**
     * Filter which SPC to delete.
     */
    where: SPCWhereUniqueInput
  }

  /**
   * SPC deleteMany
   */
  export type SPCDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SPCS to delete
     */
    where?: SPCWhereInput
    /**
     * Limit how many SPCS to delete.
     */
    limit?: number
  }

  /**
   * SPC.tranches
   */
  export type SPC$tranchesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PFTranche
     */
    select?: PFTrancheSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PFTranche
     */
    omit?: PFTrancheOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PFTrancheInclude<ExtArgs> | null
    where?: PFTrancheWhereInput
    orderBy?: PFTrancheOrderByWithRelationInput | PFTrancheOrderByWithRelationInput[]
    cursor?: PFTrancheWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PFTrancheScalarFieldEnum | PFTrancheScalarFieldEnum[]
  }

  /**
   * SPC.waterfallTiers
   */
  export type SPC$waterfallTiersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WaterfallTier
     */
    select?: WaterfallTierSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WaterfallTier
     */
    omit?: WaterfallTierOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WaterfallTierInclude<ExtArgs> | null
    where?: WaterfallTierWhereInput
    orderBy?: WaterfallTierOrderByWithRelationInput | WaterfallTierOrderByWithRelationInput[]
    cursor?: WaterfallTierWhereUniqueInput
    take?: number
    skip?: number
    distinct?: WaterfallTierScalarFieldEnum | WaterfallTierScalarFieldEnum[]
  }

  /**
   * SPC.revenueEvents
   */
  export type SPC$revenueEventsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RevenueEvent
     */
    select?: RevenueEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RevenueEvent
     */
    omit?: RevenueEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RevenueEventInclude<ExtArgs> | null
    where?: RevenueEventWhereInput
    orderBy?: RevenueEventOrderByWithRelationInput | RevenueEventOrderByWithRelationInput[]
    cursor?: RevenueEventWhereUniqueInput
    take?: number
    skip?: number
    distinct?: RevenueEventScalarFieldEnum | RevenueEventScalarFieldEnum[]
  }

  /**
   * SPC without action
   */
  export type SPCDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SPC
     */
    select?: SPCSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SPC
     */
    omit?: SPCOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SPCInclude<ExtArgs> | null
  }


  /**
   * Model PFTranche
   */

  export type AggregatePFTranche = {
    _count: PFTrancheCountAggregateOutputType | null
    _avg: PFTrancheAvgAggregateOutputType | null
    _sum: PFTrancheSumAggregateOutputType | null
    _min: PFTrancheMinAggregateOutputType | null
    _max: PFTrancheMaxAggregateOutputType | null
  }

  export type PFTrancheAvgAggregateOutputType = {
    priority: number | null
    targetAmount: number | null
    raisedAmount: number | null
    interestRate: number | null
    targetReturn: number | null
    termMonths: number | null
  }

  export type PFTrancheSumAggregateOutputType = {
    priority: number | null
    targetAmount: number | null
    raisedAmount: number | null
    interestRate: number | null
    targetReturn: number | null
    termMonths: number | null
  }

  export type PFTrancheMinAggregateOutputType = {
    id: string | null
    spcId: string | null
    name: string | null
    type: $Enums.TrancheType | null
    priority: number | null
    targetAmount: number | null
    raisedAmount: number | null
    interestRate: number | null
    targetReturn: number | null
    termMonths: number | null
    status: $Enums.TrancheStatus | null
    notes: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type PFTrancheMaxAggregateOutputType = {
    id: string | null
    spcId: string | null
    name: string | null
    type: $Enums.TrancheType | null
    priority: number | null
    targetAmount: number | null
    raisedAmount: number | null
    interestRate: number | null
    targetReturn: number | null
    termMonths: number | null
    status: $Enums.TrancheStatus | null
    notes: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type PFTrancheCountAggregateOutputType = {
    id: number
    spcId: number
    name: number
    type: number
    priority: number
    targetAmount: number
    raisedAmount: number
    interestRate: number
    targetReturn: number
    termMonths: number
    status: number
    notes: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type PFTrancheAvgAggregateInputType = {
    priority?: true
    targetAmount?: true
    raisedAmount?: true
    interestRate?: true
    targetReturn?: true
    termMonths?: true
  }

  export type PFTrancheSumAggregateInputType = {
    priority?: true
    targetAmount?: true
    raisedAmount?: true
    interestRate?: true
    targetReturn?: true
    termMonths?: true
  }

  export type PFTrancheMinAggregateInputType = {
    id?: true
    spcId?: true
    name?: true
    type?: true
    priority?: true
    targetAmount?: true
    raisedAmount?: true
    interestRate?: true
    targetReturn?: true
    termMonths?: true
    status?: true
    notes?: true
    createdAt?: true
    updatedAt?: true
  }

  export type PFTrancheMaxAggregateInputType = {
    id?: true
    spcId?: true
    name?: true
    type?: true
    priority?: true
    targetAmount?: true
    raisedAmount?: true
    interestRate?: true
    targetReturn?: true
    termMonths?: true
    status?: true
    notes?: true
    createdAt?: true
    updatedAt?: true
  }

  export type PFTrancheCountAggregateInputType = {
    id?: true
    spcId?: true
    name?: true
    type?: true
    priority?: true
    targetAmount?: true
    raisedAmount?: true
    interestRate?: true
    targetReturn?: true
    termMonths?: true
    status?: true
    notes?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type PFTrancheAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PFTranche to aggregate.
     */
    where?: PFTrancheWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PFTranches to fetch.
     */
    orderBy?: PFTrancheOrderByWithRelationInput | PFTrancheOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PFTrancheWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PFTranches from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PFTranches.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned PFTranches
    **/
    _count?: true | PFTrancheCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: PFTrancheAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: PFTrancheSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PFTrancheMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PFTrancheMaxAggregateInputType
  }

  export type GetPFTrancheAggregateType<T extends PFTrancheAggregateArgs> = {
        [P in keyof T & keyof AggregatePFTranche]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePFTranche[P]>
      : GetScalarType<T[P], AggregatePFTranche[P]>
  }




  export type PFTrancheGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PFTrancheWhereInput
    orderBy?: PFTrancheOrderByWithAggregationInput | PFTrancheOrderByWithAggregationInput[]
    by: PFTrancheScalarFieldEnum[] | PFTrancheScalarFieldEnum
    having?: PFTrancheScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PFTrancheCountAggregateInputType | true
    _avg?: PFTrancheAvgAggregateInputType
    _sum?: PFTrancheSumAggregateInputType
    _min?: PFTrancheMinAggregateInputType
    _max?: PFTrancheMaxAggregateInputType
  }

  export type PFTrancheGroupByOutputType = {
    id: string
    spcId: string
    name: string
    type: $Enums.TrancheType
    priority: number
    targetAmount: number
    raisedAmount: number
    interestRate: number | null
    targetReturn: number | null
    termMonths: number | null
    status: $Enums.TrancheStatus
    notes: string | null
    createdAt: Date
    updatedAt: Date
    _count: PFTrancheCountAggregateOutputType | null
    _avg: PFTrancheAvgAggregateOutputType | null
    _sum: PFTrancheSumAggregateOutputType | null
    _min: PFTrancheMinAggregateOutputType | null
    _max: PFTrancheMaxAggregateOutputType | null
  }

  type GetPFTrancheGroupByPayload<T extends PFTrancheGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PFTrancheGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PFTrancheGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PFTrancheGroupByOutputType[P]>
            : GetScalarType<T[P], PFTrancheGroupByOutputType[P]>
        }
      >
    >


  export type PFTrancheSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    spcId?: boolean
    name?: boolean
    type?: boolean
    priority?: boolean
    targetAmount?: boolean
    raisedAmount?: boolean
    interestRate?: boolean
    targetReturn?: boolean
    termMonths?: boolean
    status?: boolean
    notes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    spc?: boolean | SPCDefaultArgs<ExtArgs>
    investors?: boolean | PFTranche$investorsArgs<ExtArgs>
    waterfallTiers?: boolean | PFTranche$waterfallTiersArgs<ExtArgs>
    _count?: boolean | PFTrancheCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["pFTranche"]>

  export type PFTrancheSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    spcId?: boolean
    name?: boolean
    type?: boolean
    priority?: boolean
    targetAmount?: boolean
    raisedAmount?: boolean
    interestRate?: boolean
    targetReturn?: boolean
    termMonths?: boolean
    status?: boolean
    notes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    spc?: boolean | SPCDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["pFTranche"]>

  export type PFTrancheSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    spcId?: boolean
    name?: boolean
    type?: boolean
    priority?: boolean
    targetAmount?: boolean
    raisedAmount?: boolean
    interestRate?: boolean
    targetReturn?: boolean
    termMonths?: boolean
    status?: boolean
    notes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    spc?: boolean | SPCDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["pFTranche"]>

  export type PFTrancheSelectScalar = {
    id?: boolean
    spcId?: boolean
    name?: boolean
    type?: boolean
    priority?: boolean
    targetAmount?: boolean
    raisedAmount?: boolean
    interestRate?: boolean
    targetReturn?: boolean
    termMonths?: boolean
    status?: boolean
    notes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type PFTrancheOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "spcId" | "name" | "type" | "priority" | "targetAmount" | "raisedAmount" | "interestRate" | "targetReturn" | "termMonths" | "status" | "notes" | "createdAt" | "updatedAt", ExtArgs["result"]["pFTranche"]>
  export type PFTrancheInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    spc?: boolean | SPCDefaultArgs<ExtArgs>
    investors?: boolean | PFTranche$investorsArgs<ExtArgs>
    waterfallTiers?: boolean | PFTranche$waterfallTiersArgs<ExtArgs>
    _count?: boolean | PFTrancheCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type PFTrancheIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    spc?: boolean | SPCDefaultArgs<ExtArgs>
  }
  export type PFTrancheIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    spc?: boolean | SPCDefaultArgs<ExtArgs>
  }

  export type $PFTranchePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "PFTranche"
    objects: {
      spc: Prisma.$SPCPayload<ExtArgs>
      investors: Prisma.$PFTrancheInvestorPayload<ExtArgs>[]
      waterfallTiers: Prisma.$WaterfallTierPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      spcId: string
      name: string
      /**
       * senior | mezzanine | equity
       */
      type: $Enums.TrancheType
      /**
       * 1이 최선순위 (상환 우선순위)
       */
      priority: number
      /**
       * 목표 조달액 (만원)
       */
      targetAmount: number
      /**
       * 실제 조달액 (만원)
       */
      raisedAmount: number
      /**
       * 연이율 % — senior/mezzanine에 적용
       */
      interestRate: number | null
      /**
       * 목표 수익률 % — equity에 적용
       */
      targetReturn: number | null
      /**
       * 만기 (개월)
       */
      termMonths: number | null
      status: $Enums.TrancheStatus
      notes: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["pFTranche"]>
    composites: {}
  }

  type PFTrancheGetPayload<S extends boolean | null | undefined | PFTrancheDefaultArgs> = $Result.GetResult<Prisma.$PFTranchePayload, S>

  type PFTrancheCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<PFTrancheFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: PFTrancheCountAggregateInputType | true
    }

  export interface PFTrancheDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['PFTranche'], meta: { name: 'PFTranche' } }
    /**
     * Find zero or one PFTranche that matches the filter.
     * @param {PFTrancheFindUniqueArgs} args - Arguments to find a PFTranche
     * @example
     * // Get one PFTranche
     * const pFTranche = await prisma.pFTranche.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PFTrancheFindUniqueArgs>(args: SelectSubset<T, PFTrancheFindUniqueArgs<ExtArgs>>): Prisma__PFTrancheClient<$Result.GetResult<Prisma.$PFTranchePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one PFTranche that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {PFTrancheFindUniqueOrThrowArgs} args - Arguments to find a PFTranche
     * @example
     * // Get one PFTranche
     * const pFTranche = await prisma.pFTranche.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PFTrancheFindUniqueOrThrowArgs>(args: SelectSubset<T, PFTrancheFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PFTrancheClient<$Result.GetResult<Prisma.$PFTranchePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PFTranche that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PFTrancheFindFirstArgs} args - Arguments to find a PFTranche
     * @example
     * // Get one PFTranche
     * const pFTranche = await prisma.pFTranche.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PFTrancheFindFirstArgs>(args?: SelectSubset<T, PFTrancheFindFirstArgs<ExtArgs>>): Prisma__PFTrancheClient<$Result.GetResult<Prisma.$PFTranchePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PFTranche that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PFTrancheFindFirstOrThrowArgs} args - Arguments to find a PFTranche
     * @example
     * // Get one PFTranche
     * const pFTranche = await prisma.pFTranche.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PFTrancheFindFirstOrThrowArgs>(args?: SelectSubset<T, PFTrancheFindFirstOrThrowArgs<ExtArgs>>): Prisma__PFTrancheClient<$Result.GetResult<Prisma.$PFTranchePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more PFTranches that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PFTrancheFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all PFTranches
     * const pFTranches = await prisma.pFTranche.findMany()
     * 
     * // Get first 10 PFTranches
     * const pFTranches = await prisma.pFTranche.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const pFTrancheWithIdOnly = await prisma.pFTranche.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PFTrancheFindManyArgs>(args?: SelectSubset<T, PFTrancheFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PFTranchePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a PFTranche.
     * @param {PFTrancheCreateArgs} args - Arguments to create a PFTranche.
     * @example
     * // Create one PFTranche
     * const PFTranche = await prisma.pFTranche.create({
     *   data: {
     *     // ... data to create a PFTranche
     *   }
     * })
     * 
     */
    create<T extends PFTrancheCreateArgs>(args: SelectSubset<T, PFTrancheCreateArgs<ExtArgs>>): Prisma__PFTrancheClient<$Result.GetResult<Prisma.$PFTranchePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many PFTranches.
     * @param {PFTrancheCreateManyArgs} args - Arguments to create many PFTranches.
     * @example
     * // Create many PFTranches
     * const pFTranche = await prisma.pFTranche.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PFTrancheCreateManyArgs>(args?: SelectSubset<T, PFTrancheCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many PFTranches and returns the data saved in the database.
     * @param {PFTrancheCreateManyAndReturnArgs} args - Arguments to create many PFTranches.
     * @example
     * // Create many PFTranches
     * const pFTranche = await prisma.pFTranche.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many PFTranches and only return the `id`
     * const pFTrancheWithIdOnly = await prisma.pFTranche.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PFTrancheCreateManyAndReturnArgs>(args?: SelectSubset<T, PFTrancheCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PFTranchePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a PFTranche.
     * @param {PFTrancheDeleteArgs} args - Arguments to delete one PFTranche.
     * @example
     * // Delete one PFTranche
     * const PFTranche = await prisma.pFTranche.delete({
     *   where: {
     *     // ... filter to delete one PFTranche
     *   }
     * })
     * 
     */
    delete<T extends PFTrancheDeleteArgs>(args: SelectSubset<T, PFTrancheDeleteArgs<ExtArgs>>): Prisma__PFTrancheClient<$Result.GetResult<Prisma.$PFTranchePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one PFTranche.
     * @param {PFTrancheUpdateArgs} args - Arguments to update one PFTranche.
     * @example
     * // Update one PFTranche
     * const pFTranche = await prisma.pFTranche.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PFTrancheUpdateArgs>(args: SelectSubset<T, PFTrancheUpdateArgs<ExtArgs>>): Prisma__PFTrancheClient<$Result.GetResult<Prisma.$PFTranchePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more PFTranches.
     * @param {PFTrancheDeleteManyArgs} args - Arguments to filter PFTranches to delete.
     * @example
     * // Delete a few PFTranches
     * const { count } = await prisma.pFTranche.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PFTrancheDeleteManyArgs>(args?: SelectSubset<T, PFTrancheDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PFTranches.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PFTrancheUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many PFTranches
     * const pFTranche = await prisma.pFTranche.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PFTrancheUpdateManyArgs>(args: SelectSubset<T, PFTrancheUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PFTranches and returns the data updated in the database.
     * @param {PFTrancheUpdateManyAndReturnArgs} args - Arguments to update many PFTranches.
     * @example
     * // Update many PFTranches
     * const pFTranche = await prisma.pFTranche.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more PFTranches and only return the `id`
     * const pFTrancheWithIdOnly = await prisma.pFTranche.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends PFTrancheUpdateManyAndReturnArgs>(args: SelectSubset<T, PFTrancheUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PFTranchePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one PFTranche.
     * @param {PFTrancheUpsertArgs} args - Arguments to update or create a PFTranche.
     * @example
     * // Update or create a PFTranche
     * const pFTranche = await prisma.pFTranche.upsert({
     *   create: {
     *     // ... data to create a PFTranche
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the PFTranche we want to update
     *   }
     * })
     */
    upsert<T extends PFTrancheUpsertArgs>(args: SelectSubset<T, PFTrancheUpsertArgs<ExtArgs>>): Prisma__PFTrancheClient<$Result.GetResult<Prisma.$PFTranchePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of PFTranches.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PFTrancheCountArgs} args - Arguments to filter PFTranches to count.
     * @example
     * // Count the number of PFTranches
     * const count = await prisma.pFTranche.count({
     *   where: {
     *     // ... the filter for the PFTranches we want to count
     *   }
     * })
    **/
    count<T extends PFTrancheCountArgs>(
      args?: Subset<T, PFTrancheCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PFTrancheCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a PFTranche.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PFTrancheAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PFTrancheAggregateArgs>(args: Subset<T, PFTrancheAggregateArgs>): Prisma.PrismaPromise<GetPFTrancheAggregateType<T>>

    /**
     * Group by PFTranche.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PFTrancheGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PFTrancheGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PFTrancheGroupByArgs['orderBy'] }
        : { orderBy?: PFTrancheGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PFTrancheGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPFTrancheGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the PFTranche model
   */
  readonly fields: PFTrancheFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for PFTranche.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PFTrancheClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    spc<T extends SPCDefaultArgs<ExtArgs> = {}>(args?: Subset<T, SPCDefaultArgs<ExtArgs>>): Prisma__SPCClient<$Result.GetResult<Prisma.$SPCPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    investors<T extends PFTranche$investorsArgs<ExtArgs> = {}>(args?: Subset<T, PFTranche$investorsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PFTrancheInvestorPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    waterfallTiers<T extends PFTranche$waterfallTiersArgs<ExtArgs> = {}>(args?: Subset<T, PFTranche$waterfallTiersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WaterfallTierPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the PFTranche model
   */
  interface PFTrancheFieldRefs {
    readonly id: FieldRef<"PFTranche", 'String'>
    readonly spcId: FieldRef<"PFTranche", 'String'>
    readonly name: FieldRef<"PFTranche", 'String'>
    readonly type: FieldRef<"PFTranche", 'TrancheType'>
    readonly priority: FieldRef<"PFTranche", 'Int'>
    readonly targetAmount: FieldRef<"PFTranche", 'Int'>
    readonly raisedAmount: FieldRef<"PFTranche", 'Int'>
    readonly interestRate: FieldRef<"PFTranche", 'Float'>
    readonly targetReturn: FieldRef<"PFTranche", 'Float'>
    readonly termMonths: FieldRef<"PFTranche", 'Int'>
    readonly status: FieldRef<"PFTranche", 'TrancheStatus'>
    readonly notes: FieldRef<"PFTranche", 'String'>
    readonly createdAt: FieldRef<"PFTranche", 'DateTime'>
    readonly updatedAt: FieldRef<"PFTranche", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * PFTranche findUnique
   */
  export type PFTrancheFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PFTranche
     */
    select?: PFTrancheSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PFTranche
     */
    omit?: PFTrancheOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PFTrancheInclude<ExtArgs> | null
    /**
     * Filter, which PFTranche to fetch.
     */
    where: PFTrancheWhereUniqueInput
  }

  /**
   * PFTranche findUniqueOrThrow
   */
  export type PFTrancheFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PFTranche
     */
    select?: PFTrancheSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PFTranche
     */
    omit?: PFTrancheOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PFTrancheInclude<ExtArgs> | null
    /**
     * Filter, which PFTranche to fetch.
     */
    where: PFTrancheWhereUniqueInput
  }

  /**
   * PFTranche findFirst
   */
  export type PFTrancheFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PFTranche
     */
    select?: PFTrancheSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PFTranche
     */
    omit?: PFTrancheOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PFTrancheInclude<ExtArgs> | null
    /**
     * Filter, which PFTranche to fetch.
     */
    where?: PFTrancheWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PFTranches to fetch.
     */
    orderBy?: PFTrancheOrderByWithRelationInput | PFTrancheOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PFTranches.
     */
    cursor?: PFTrancheWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PFTranches from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PFTranches.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PFTranches.
     */
    distinct?: PFTrancheScalarFieldEnum | PFTrancheScalarFieldEnum[]
  }

  /**
   * PFTranche findFirstOrThrow
   */
  export type PFTrancheFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PFTranche
     */
    select?: PFTrancheSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PFTranche
     */
    omit?: PFTrancheOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PFTrancheInclude<ExtArgs> | null
    /**
     * Filter, which PFTranche to fetch.
     */
    where?: PFTrancheWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PFTranches to fetch.
     */
    orderBy?: PFTrancheOrderByWithRelationInput | PFTrancheOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PFTranches.
     */
    cursor?: PFTrancheWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PFTranches from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PFTranches.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PFTranches.
     */
    distinct?: PFTrancheScalarFieldEnum | PFTrancheScalarFieldEnum[]
  }

  /**
   * PFTranche findMany
   */
  export type PFTrancheFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PFTranche
     */
    select?: PFTrancheSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PFTranche
     */
    omit?: PFTrancheOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PFTrancheInclude<ExtArgs> | null
    /**
     * Filter, which PFTranches to fetch.
     */
    where?: PFTrancheWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PFTranches to fetch.
     */
    orderBy?: PFTrancheOrderByWithRelationInput | PFTrancheOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing PFTranches.
     */
    cursor?: PFTrancheWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PFTranches from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PFTranches.
     */
    skip?: number
    distinct?: PFTrancheScalarFieldEnum | PFTrancheScalarFieldEnum[]
  }

  /**
   * PFTranche create
   */
  export type PFTrancheCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PFTranche
     */
    select?: PFTrancheSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PFTranche
     */
    omit?: PFTrancheOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PFTrancheInclude<ExtArgs> | null
    /**
     * The data needed to create a PFTranche.
     */
    data: XOR<PFTrancheCreateInput, PFTrancheUncheckedCreateInput>
  }

  /**
   * PFTranche createMany
   */
  export type PFTrancheCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many PFTranches.
     */
    data: PFTrancheCreateManyInput | PFTrancheCreateManyInput[]
  }

  /**
   * PFTranche createManyAndReturn
   */
  export type PFTrancheCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PFTranche
     */
    select?: PFTrancheSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the PFTranche
     */
    omit?: PFTrancheOmit<ExtArgs> | null
    /**
     * The data used to create many PFTranches.
     */
    data: PFTrancheCreateManyInput | PFTrancheCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PFTrancheIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * PFTranche update
   */
  export type PFTrancheUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PFTranche
     */
    select?: PFTrancheSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PFTranche
     */
    omit?: PFTrancheOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PFTrancheInclude<ExtArgs> | null
    /**
     * The data needed to update a PFTranche.
     */
    data: XOR<PFTrancheUpdateInput, PFTrancheUncheckedUpdateInput>
    /**
     * Choose, which PFTranche to update.
     */
    where: PFTrancheWhereUniqueInput
  }

  /**
   * PFTranche updateMany
   */
  export type PFTrancheUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update PFTranches.
     */
    data: XOR<PFTrancheUpdateManyMutationInput, PFTrancheUncheckedUpdateManyInput>
    /**
     * Filter which PFTranches to update
     */
    where?: PFTrancheWhereInput
    /**
     * Limit how many PFTranches to update.
     */
    limit?: number
  }

  /**
   * PFTranche updateManyAndReturn
   */
  export type PFTrancheUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PFTranche
     */
    select?: PFTrancheSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the PFTranche
     */
    omit?: PFTrancheOmit<ExtArgs> | null
    /**
     * The data used to update PFTranches.
     */
    data: XOR<PFTrancheUpdateManyMutationInput, PFTrancheUncheckedUpdateManyInput>
    /**
     * Filter which PFTranches to update
     */
    where?: PFTrancheWhereInput
    /**
     * Limit how many PFTranches to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PFTrancheIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * PFTranche upsert
   */
  export type PFTrancheUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PFTranche
     */
    select?: PFTrancheSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PFTranche
     */
    omit?: PFTrancheOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PFTrancheInclude<ExtArgs> | null
    /**
     * The filter to search for the PFTranche to update in case it exists.
     */
    where: PFTrancheWhereUniqueInput
    /**
     * In case the PFTranche found by the `where` argument doesn't exist, create a new PFTranche with this data.
     */
    create: XOR<PFTrancheCreateInput, PFTrancheUncheckedCreateInput>
    /**
     * In case the PFTranche was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PFTrancheUpdateInput, PFTrancheUncheckedUpdateInput>
  }

  /**
   * PFTranche delete
   */
  export type PFTrancheDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PFTranche
     */
    select?: PFTrancheSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PFTranche
     */
    omit?: PFTrancheOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PFTrancheInclude<ExtArgs> | null
    /**
     * Filter which PFTranche to delete.
     */
    where: PFTrancheWhereUniqueInput
  }

  /**
   * PFTranche deleteMany
   */
  export type PFTrancheDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PFTranches to delete
     */
    where?: PFTrancheWhereInput
    /**
     * Limit how many PFTranches to delete.
     */
    limit?: number
  }

  /**
   * PFTranche.investors
   */
  export type PFTranche$investorsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PFTrancheInvestor
     */
    select?: PFTrancheInvestorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PFTrancheInvestor
     */
    omit?: PFTrancheInvestorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PFTrancheInvestorInclude<ExtArgs> | null
    where?: PFTrancheInvestorWhereInput
    orderBy?: PFTrancheInvestorOrderByWithRelationInput | PFTrancheInvestorOrderByWithRelationInput[]
    cursor?: PFTrancheInvestorWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PFTrancheInvestorScalarFieldEnum | PFTrancheInvestorScalarFieldEnum[]
  }

  /**
   * PFTranche.waterfallTiers
   */
  export type PFTranche$waterfallTiersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WaterfallTier
     */
    select?: WaterfallTierSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WaterfallTier
     */
    omit?: WaterfallTierOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WaterfallTierInclude<ExtArgs> | null
    where?: WaterfallTierWhereInput
    orderBy?: WaterfallTierOrderByWithRelationInput | WaterfallTierOrderByWithRelationInput[]
    cursor?: WaterfallTierWhereUniqueInput
    take?: number
    skip?: number
    distinct?: WaterfallTierScalarFieldEnum | WaterfallTierScalarFieldEnum[]
  }

  /**
   * PFTranche without action
   */
  export type PFTrancheDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PFTranche
     */
    select?: PFTrancheSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PFTranche
     */
    omit?: PFTrancheOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PFTrancheInclude<ExtArgs> | null
  }


  /**
   * Model PFTrancheInvestor
   */

  export type AggregatePFTrancheInvestor = {
    _count: PFTrancheInvestorCountAggregateOutputType | null
    _avg: PFTrancheInvestorAvgAggregateOutputType | null
    _sum: PFTrancheInvestorSumAggregateOutputType | null
    _min: PFTrancheInvestorMinAggregateOutputType | null
    _max: PFTrancheInvestorMaxAggregateOutputType | null
  }

  export type PFTrancheInvestorAvgAggregateOutputType = {
    amount: number | null
    percentage: number | null
  }

  export type PFTrancheInvestorSumAggregateOutputType = {
    amount: number | null
    percentage: number | null
  }

  export type PFTrancheInvestorMinAggregateOutputType = {
    id: string | null
    trancheId: string | null
    investorId: string | null
    amount: number | null
    percentage: number | null
    joinedAt: Date | null
    notes: string | null
  }

  export type PFTrancheInvestorMaxAggregateOutputType = {
    id: string | null
    trancheId: string | null
    investorId: string | null
    amount: number | null
    percentage: number | null
    joinedAt: Date | null
    notes: string | null
  }

  export type PFTrancheInvestorCountAggregateOutputType = {
    id: number
    trancheId: number
    investorId: number
    amount: number
    percentage: number
    joinedAt: number
    notes: number
    _all: number
  }


  export type PFTrancheInvestorAvgAggregateInputType = {
    amount?: true
    percentage?: true
  }

  export type PFTrancheInvestorSumAggregateInputType = {
    amount?: true
    percentage?: true
  }

  export type PFTrancheInvestorMinAggregateInputType = {
    id?: true
    trancheId?: true
    investorId?: true
    amount?: true
    percentage?: true
    joinedAt?: true
    notes?: true
  }

  export type PFTrancheInvestorMaxAggregateInputType = {
    id?: true
    trancheId?: true
    investorId?: true
    amount?: true
    percentage?: true
    joinedAt?: true
    notes?: true
  }

  export type PFTrancheInvestorCountAggregateInputType = {
    id?: true
    trancheId?: true
    investorId?: true
    amount?: true
    percentage?: true
    joinedAt?: true
    notes?: true
    _all?: true
  }

  export type PFTrancheInvestorAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PFTrancheInvestor to aggregate.
     */
    where?: PFTrancheInvestorWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PFTrancheInvestors to fetch.
     */
    orderBy?: PFTrancheInvestorOrderByWithRelationInput | PFTrancheInvestorOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PFTrancheInvestorWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PFTrancheInvestors from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PFTrancheInvestors.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned PFTrancheInvestors
    **/
    _count?: true | PFTrancheInvestorCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: PFTrancheInvestorAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: PFTrancheInvestorSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PFTrancheInvestorMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PFTrancheInvestorMaxAggregateInputType
  }

  export type GetPFTrancheInvestorAggregateType<T extends PFTrancheInvestorAggregateArgs> = {
        [P in keyof T & keyof AggregatePFTrancheInvestor]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePFTrancheInvestor[P]>
      : GetScalarType<T[P], AggregatePFTrancheInvestor[P]>
  }




  export type PFTrancheInvestorGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PFTrancheInvestorWhereInput
    orderBy?: PFTrancheInvestorOrderByWithAggregationInput | PFTrancheInvestorOrderByWithAggregationInput[]
    by: PFTrancheInvestorScalarFieldEnum[] | PFTrancheInvestorScalarFieldEnum
    having?: PFTrancheInvestorScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PFTrancheInvestorCountAggregateInputType | true
    _avg?: PFTrancheInvestorAvgAggregateInputType
    _sum?: PFTrancheInvestorSumAggregateInputType
    _min?: PFTrancheInvestorMinAggregateInputType
    _max?: PFTrancheInvestorMaxAggregateInputType
  }

  export type PFTrancheInvestorGroupByOutputType = {
    id: string
    trancheId: string
    investorId: string
    amount: number
    percentage: number | null
    joinedAt: Date
    notes: string | null
    _count: PFTrancheInvestorCountAggregateOutputType | null
    _avg: PFTrancheInvestorAvgAggregateOutputType | null
    _sum: PFTrancheInvestorSumAggregateOutputType | null
    _min: PFTrancheInvestorMinAggregateOutputType | null
    _max: PFTrancheInvestorMaxAggregateOutputType | null
  }

  type GetPFTrancheInvestorGroupByPayload<T extends PFTrancheInvestorGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PFTrancheInvestorGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PFTrancheInvestorGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PFTrancheInvestorGroupByOutputType[P]>
            : GetScalarType<T[P], PFTrancheInvestorGroupByOutputType[P]>
        }
      >
    >


  export type PFTrancheInvestorSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    trancheId?: boolean
    investorId?: boolean
    amount?: boolean
    percentage?: boolean
    joinedAt?: boolean
    notes?: boolean
    tranche?: boolean | PFTrancheDefaultArgs<ExtArgs>
    investor?: boolean | InvestorDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["pFTrancheInvestor"]>

  export type PFTrancheInvestorSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    trancheId?: boolean
    investorId?: boolean
    amount?: boolean
    percentage?: boolean
    joinedAt?: boolean
    notes?: boolean
    tranche?: boolean | PFTrancheDefaultArgs<ExtArgs>
    investor?: boolean | InvestorDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["pFTrancheInvestor"]>

  export type PFTrancheInvestorSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    trancheId?: boolean
    investorId?: boolean
    amount?: boolean
    percentage?: boolean
    joinedAt?: boolean
    notes?: boolean
    tranche?: boolean | PFTrancheDefaultArgs<ExtArgs>
    investor?: boolean | InvestorDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["pFTrancheInvestor"]>

  export type PFTrancheInvestorSelectScalar = {
    id?: boolean
    trancheId?: boolean
    investorId?: boolean
    amount?: boolean
    percentage?: boolean
    joinedAt?: boolean
    notes?: boolean
  }

  export type PFTrancheInvestorOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "trancheId" | "investorId" | "amount" | "percentage" | "joinedAt" | "notes", ExtArgs["result"]["pFTrancheInvestor"]>
  export type PFTrancheInvestorInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tranche?: boolean | PFTrancheDefaultArgs<ExtArgs>
    investor?: boolean | InvestorDefaultArgs<ExtArgs>
  }
  export type PFTrancheInvestorIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tranche?: boolean | PFTrancheDefaultArgs<ExtArgs>
    investor?: boolean | InvestorDefaultArgs<ExtArgs>
  }
  export type PFTrancheInvestorIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tranche?: boolean | PFTrancheDefaultArgs<ExtArgs>
    investor?: boolean | InvestorDefaultArgs<ExtArgs>
  }

  export type $PFTrancheInvestorPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "PFTrancheInvestor"
    objects: {
      tranche: Prisma.$PFTranchePayload<ExtArgs>
      investor: Prisma.$InvestorPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      trancheId: string
      investorId: string
      /**
       * 투자액 (만원)
       */
      amount: number
      /**
       * 지분율 % (자동 계산 or 수동 입력)
       */
      percentage: number | null
      joinedAt: Date
      notes: string | null
    }, ExtArgs["result"]["pFTrancheInvestor"]>
    composites: {}
  }

  type PFTrancheInvestorGetPayload<S extends boolean | null | undefined | PFTrancheInvestorDefaultArgs> = $Result.GetResult<Prisma.$PFTrancheInvestorPayload, S>

  type PFTrancheInvestorCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<PFTrancheInvestorFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: PFTrancheInvestorCountAggregateInputType | true
    }

  export interface PFTrancheInvestorDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['PFTrancheInvestor'], meta: { name: 'PFTrancheInvestor' } }
    /**
     * Find zero or one PFTrancheInvestor that matches the filter.
     * @param {PFTrancheInvestorFindUniqueArgs} args - Arguments to find a PFTrancheInvestor
     * @example
     * // Get one PFTrancheInvestor
     * const pFTrancheInvestor = await prisma.pFTrancheInvestor.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PFTrancheInvestorFindUniqueArgs>(args: SelectSubset<T, PFTrancheInvestorFindUniqueArgs<ExtArgs>>): Prisma__PFTrancheInvestorClient<$Result.GetResult<Prisma.$PFTrancheInvestorPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one PFTrancheInvestor that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {PFTrancheInvestorFindUniqueOrThrowArgs} args - Arguments to find a PFTrancheInvestor
     * @example
     * // Get one PFTrancheInvestor
     * const pFTrancheInvestor = await prisma.pFTrancheInvestor.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PFTrancheInvestorFindUniqueOrThrowArgs>(args: SelectSubset<T, PFTrancheInvestorFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PFTrancheInvestorClient<$Result.GetResult<Prisma.$PFTrancheInvestorPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PFTrancheInvestor that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PFTrancheInvestorFindFirstArgs} args - Arguments to find a PFTrancheInvestor
     * @example
     * // Get one PFTrancheInvestor
     * const pFTrancheInvestor = await prisma.pFTrancheInvestor.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PFTrancheInvestorFindFirstArgs>(args?: SelectSubset<T, PFTrancheInvestorFindFirstArgs<ExtArgs>>): Prisma__PFTrancheInvestorClient<$Result.GetResult<Prisma.$PFTrancheInvestorPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PFTrancheInvestor that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PFTrancheInvestorFindFirstOrThrowArgs} args - Arguments to find a PFTrancheInvestor
     * @example
     * // Get one PFTrancheInvestor
     * const pFTrancheInvestor = await prisma.pFTrancheInvestor.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PFTrancheInvestorFindFirstOrThrowArgs>(args?: SelectSubset<T, PFTrancheInvestorFindFirstOrThrowArgs<ExtArgs>>): Prisma__PFTrancheInvestorClient<$Result.GetResult<Prisma.$PFTrancheInvestorPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more PFTrancheInvestors that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PFTrancheInvestorFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all PFTrancheInvestors
     * const pFTrancheInvestors = await prisma.pFTrancheInvestor.findMany()
     * 
     * // Get first 10 PFTrancheInvestors
     * const pFTrancheInvestors = await prisma.pFTrancheInvestor.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const pFTrancheInvestorWithIdOnly = await prisma.pFTrancheInvestor.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PFTrancheInvestorFindManyArgs>(args?: SelectSubset<T, PFTrancheInvestorFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PFTrancheInvestorPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a PFTrancheInvestor.
     * @param {PFTrancheInvestorCreateArgs} args - Arguments to create a PFTrancheInvestor.
     * @example
     * // Create one PFTrancheInvestor
     * const PFTrancheInvestor = await prisma.pFTrancheInvestor.create({
     *   data: {
     *     // ... data to create a PFTrancheInvestor
     *   }
     * })
     * 
     */
    create<T extends PFTrancheInvestorCreateArgs>(args: SelectSubset<T, PFTrancheInvestorCreateArgs<ExtArgs>>): Prisma__PFTrancheInvestorClient<$Result.GetResult<Prisma.$PFTrancheInvestorPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many PFTrancheInvestors.
     * @param {PFTrancheInvestorCreateManyArgs} args - Arguments to create many PFTrancheInvestors.
     * @example
     * // Create many PFTrancheInvestors
     * const pFTrancheInvestor = await prisma.pFTrancheInvestor.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PFTrancheInvestorCreateManyArgs>(args?: SelectSubset<T, PFTrancheInvestorCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many PFTrancheInvestors and returns the data saved in the database.
     * @param {PFTrancheInvestorCreateManyAndReturnArgs} args - Arguments to create many PFTrancheInvestors.
     * @example
     * // Create many PFTrancheInvestors
     * const pFTrancheInvestor = await prisma.pFTrancheInvestor.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many PFTrancheInvestors and only return the `id`
     * const pFTrancheInvestorWithIdOnly = await prisma.pFTrancheInvestor.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PFTrancheInvestorCreateManyAndReturnArgs>(args?: SelectSubset<T, PFTrancheInvestorCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PFTrancheInvestorPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a PFTrancheInvestor.
     * @param {PFTrancheInvestorDeleteArgs} args - Arguments to delete one PFTrancheInvestor.
     * @example
     * // Delete one PFTrancheInvestor
     * const PFTrancheInvestor = await prisma.pFTrancheInvestor.delete({
     *   where: {
     *     // ... filter to delete one PFTrancheInvestor
     *   }
     * })
     * 
     */
    delete<T extends PFTrancheInvestorDeleteArgs>(args: SelectSubset<T, PFTrancheInvestorDeleteArgs<ExtArgs>>): Prisma__PFTrancheInvestorClient<$Result.GetResult<Prisma.$PFTrancheInvestorPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one PFTrancheInvestor.
     * @param {PFTrancheInvestorUpdateArgs} args - Arguments to update one PFTrancheInvestor.
     * @example
     * // Update one PFTrancheInvestor
     * const pFTrancheInvestor = await prisma.pFTrancheInvestor.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PFTrancheInvestorUpdateArgs>(args: SelectSubset<T, PFTrancheInvestorUpdateArgs<ExtArgs>>): Prisma__PFTrancheInvestorClient<$Result.GetResult<Prisma.$PFTrancheInvestorPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more PFTrancheInvestors.
     * @param {PFTrancheInvestorDeleteManyArgs} args - Arguments to filter PFTrancheInvestors to delete.
     * @example
     * // Delete a few PFTrancheInvestors
     * const { count } = await prisma.pFTrancheInvestor.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PFTrancheInvestorDeleteManyArgs>(args?: SelectSubset<T, PFTrancheInvestorDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PFTrancheInvestors.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PFTrancheInvestorUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many PFTrancheInvestors
     * const pFTrancheInvestor = await prisma.pFTrancheInvestor.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PFTrancheInvestorUpdateManyArgs>(args: SelectSubset<T, PFTrancheInvestorUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PFTrancheInvestors and returns the data updated in the database.
     * @param {PFTrancheInvestorUpdateManyAndReturnArgs} args - Arguments to update many PFTrancheInvestors.
     * @example
     * // Update many PFTrancheInvestors
     * const pFTrancheInvestor = await prisma.pFTrancheInvestor.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more PFTrancheInvestors and only return the `id`
     * const pFTrancheInvestorWithIdOnly = await prisma.pFTrancheInvestor.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends PFTrancheInvestorUpdateManyAndReturnArgs>(args: SelectSubset<T, PFTrancheInvestorUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PFTrancheInvestorPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one PFTrancheInvestor.
     * @param {PFTrancheInvestorUpsertArgs} args - Arguments to update or create a PFTrancheInvestor.
     * @example
     * // Update or create a PFTrancheInvestor
     * const pFTrancheInvestor = await prisma.pFTrancheInvestor.upsert({
     *   create: {
     *     // ... data to create a PFTrancheInvestor
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the PFTrancheInvestor we want to update
     *   }
     * })
     */
    upsert<T extends PFTrancheInvestorUpsertArgs>(args: SelectSubset<T, PFTrancheInvestorUpsertArgs<ExtArgs>>): Prisma__PFTrancheInvestorClient<$Result.GetResult<Prisma.$PFTrancheInvestorPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of PFTrancheInvestors.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PFTrancheInvestorCountArgs} args - Arguments to filter PFTrancheInvestors to count.
     * @example
     * // Count the number of PFTrancheInvestors
     * const count = await prisma.pFTrancheInvestor.count({
     *   where: {
     *     // ... the filter for the PFTrancheInvestors we want to count
     *   }
     * })
    **/
    count<T extends PFTrancheInvestorCountArgs>(
      args?: Subset<T, PFTrancheInvestorCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PFTrancheInvestorCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a PFTrancheInvestor.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PFTrancheInvestorAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PFTrancheInvestorAggregateArgs>(args: Subset<T, PFTrancheInvestorAggregateArgs>): Prisma.PrismaPromise<GetPFTrancheInvestorAggregateType<T>>

    /**
     * Group by PFTrancheInvestor.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PFTrancheInvestorGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PFTrancheInvestorGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PFTrancheInvestorGroupByArgs['orderBy'] }
        : { orderBy?: PFTrancheInvestorGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PFTrancheInvestorGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPFTrancheInvestorGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the PFTrancheInvestor model
   */
  readonly fields: PFTrancheInvestorFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for PFTrancheInvestor.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PFTrancheInvestorClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    tranche<T extends PFTrancheDefaultArgs<ExtArgs> = {}>(args?: Subset<T, PFTrancheDefaultArgs<ExtArgs>>): Prisma__PFTrancheClient<$Result.GetResult<Prisma.$PFTranchePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    investor<T extends InvestorDefaultArgs<ExtArgs> = {}>(args?: Subset<T, InvestorDefaultArgs<ExtArgs>>): Prisma__InvestorClient<$Result.GetResult<Prisma.$InvestorPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the PFTrancheInvestor model
   */
  interface PFTrancheInvestorFieldRefs {
    readonly id: FieldRef<"PFTrancheInvestor", 'String'>
    readonly trancheId: FieldRef<"PFTrancheInvestor", 'String'>
    readonly investorId: FieldRef<"PFTrancheInvestor", 'String'>
    readonly amount: FieldRef<"PFTrancheInvestor", 'Int'>
    readonly percentage: FieldRef<"PFTrancheInvestor", 'Float'>
    readonly joinedAt: FieldRef<"PFTrancheInvestor", 'DateTime'>
    readonly notes: FieldRef<"PFTrancheInvestor", 'String'>
  }
    

  // Custom InputTypes
  /**
   * PFTrancheInvestor findUnique
   */
  export type PFTrancheInvestorFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PFTrancheInvestor
     */
    select?: PFTrancheInvestorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PFTrancheInvestor
     */
    omit?: PFTrancheInvestorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PFTrancheInvestorInclude<ExtArgs> | null
    /**
     * Filter, which PFTrancheInvestor to fetch.
     */
    where: PFTrancheInvestorWhereUniqueInput
  }

  /**
   * PFTrancheInvestor findUniqueOrThrow
   */
  export type PFTrancheInvestorFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PFTrancheInvestor
     */
    select?: PFTrancheInvestorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PFTrancheInvestor
     */
    omit?: PFTrancheInvestorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PFTrancheInvestorInclude<ExtArgs> | null
    /**
     * Filter, which PFTrancheInvestor to fetch.
     */
    where: PFTrancheInvestorWhereUniqueInput
  }

  /**
   * PFTrancheInvestor findFirst
   */
  export type PFTrancheInvestorFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PFTrancheInvestor
     */
    select?: PFTrancheInvestorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PFTrancheInvestor
     */
    omit?: PFTrancheInvestorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PFTrancheInvestorInclude<ExtArgs> | null
    /**
     * Filter, which PFTrancheInvestor to fetch.
     */
    where?: PFTrancheInvestorWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PFTrancheInvestors to fetch.
     */
    orderBy?: PFTrancheInvestorOrderByWithRelationInput | PFTrancheInvestorOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PFTrancheInvestors.
     */
    cursor?: PFTrancheInvestorWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PFTrancheInvestors from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PFTrancheInvestors.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PFTrancheInvestors.
     */
    distinct?: PFTrancheInvestorScalarFieldEnum | PFTrancheInvestorScalarFieldEnum[]
  }

  /**
   * PFTrancheInvestor findFirstOrThrow
   */
  export type PFTrancheInvestorFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PFTrancheInvestor
     */
    select?: PFTrancheInvestorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PFTrancheInvestor
     */
    omit?: PFTrancheInvestorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PFTrancheInvestorInclude<ExtArgs> | null
    /**
     * Filter, which PFTrancheInvestor to fetch.
     */
    where?: PFTrancheInvestorWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PFTrancheInvestors to fetch.
     */
    orderBy?: PFTrancheInvestorOrderByWithRelationInput | PFTrancheInvestorOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PFTrancheInvestors.
     */
    cursor?: PFTrancheInvestorWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PFTrancheInvestors from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PFTrancheInvestors.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PFTrancheInvestors.
     */
    distinct?: PFTrancheInvestorScalarFieldEnum | PFTrancheInvestorScalarFieldEnum[]
  }

  /**
   * PFTrancheInvestor findMany
   */
  export type PFTrancheInvestorFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PFTrancheInvestor
     */
    select?: PFTrancheInvestorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PFTrancheInvestor
     */
    omit?: PFTrancheInvestorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PFTrancheInvestorInclude<ExtArgs> | null
    /**
     * Filter, which PFTrancheInvestors to fetch.
     */
    where?: PFTrancheInvestorWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PFTrancheInvestors to fetch.
     */
    orderBy?: PFTrancheInvestorOrderByWithRelationInput | PFTrancheInvestorOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing PFTrancheInvestors.
     */
    cursor?: PFTrancheInvestorWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PFTrancheInvestors from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PFTrancheInvestors.
     */
    skip?: number
    distinct?: PFTrancheInvestorScalarFieldEnum | PFTrancheInvestorScalarFieldEnum[]
  }

  /**
   * PFTrancheInvestor create
   */
  export type PFTrancheInvestorCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PFTrancheInvestor
     */
    select?: PFTrancheInvestorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PFTrancheInvestor
     */
    omit?: PFTrancheInvestorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PFTrancheInvestorInclude<ExtArgs> | null
    /**
     * The data needed to create a PFTrancheInvestor.
     */
    data: XOR<PFTrancheInvestorCreateInput, PFTrancheInvestorUncheckedCreateInput>
  }

  /**
   * PFTrancheInvestor createMany
   */
  export type PFTrancheInvestorCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many PFTrancheInvestors.
     */
    data: PFTrancheInvestorCreateManyInput | PFTrancheInvestorCreateManyInput[]
  }

  /**
   * PFTrancheInvestor createManyAndReturn
   */
  export type PFTrancheInvestorCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PFTrancheInvestor
     */
    select?: PFTrancheInvestorSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the PFTrancheInvestor
     */
    omit?: PFTrancheInvestorOmit<ExtArgs> | null
    /**
     * The data used to create many PFTrancheInvestors.
     */
    data: PFTrancheInvestorCreateManyInput | PFTrancheInvestorCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PFTrancheInvestorIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * PFTrancheInvestor update
   */
  export type PFTrancheInvestorUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PFTrancheInvestor
     */
    select?: PFTrancheInvestorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PFTrancheInvestor
     */
    omit?: PFTrancheInvestorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PFTrancheInvestorInclude<ExtArgs> | null
    /**
     * The data needed to update a PFTrancheInvestor.
     */
    data: XOR<PFTrancheInvestorUpdateInput, PFTrancheInvestorUncheckedUpdateInput>
    /**
     * Choose, which PFTrancheInvestor to update.
     */
    where: PFTrancheInvestorWhereUniqueInput
  }

  /**
   * PFTrancheInvestor updateMany
   */
  export type PFTrancheInvestorUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update PFTrancheInvestors.
     */
    data: XOR<PFTrancheInvestorUpdateManyMutationInput, PFTrancheInvestorUncheckedUpdateManyInput>
    /**
     * Filter which PFTrancheInvestors to update
     */
    where?: PFTrancheInvestorWhereInput
    /**
     * Limit how many PFTrancheInvestors to update.
     */
    limit?: number
  }

  /**
   * PFTrancheInvestor updateManyAndReturn
   */
  export type PFTrancheInvestorUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PFTrancheInvestor
     */
    select?: PFTrancheInvestorSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the PFTrancheInvestor
     */
    omit?: PFTrancheInvestorOmit<ExtArgs> | null
    /**
     * The data used to update PFTrancheInvestors.
     */
    data: XOR<PFTrancheInvestorUpdateManyMutationInput, PFTrancheInvestorUncheckedUpdateManyInput>
    /**
     * Filter which PFTrancheInvestors to update
     */
    where?: PFTrancheInvestorWhereInput
    /**
     * Limit how many PFTrancheInvestors to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PFTrancheInvestorIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * PFTrancheInvestor upsert
   */
  export type PFTrancheInvestorUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PFTrancheInvestor
     */
    select?: PFTrancheInvestorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PFTrancheInvestor
     */
    omit?: PFTrancheInvestorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PFTrancheInvestorInclude<ExtArgs> | null
    /**
     * The filter to search for the PFTrancheInvestor to update in case it exists.
     */
    where: PFTrancheInvestorWhereUniqueInput
    /**
     * In case the PFTrancheInvestor found by the `where` argument doesn't exist, create a new PFTrancheInvestor with this data.
     */
    create: XOR<PFTrancheInvestorCreateInput, PFTrancheInvestorUncheckedCreateInput>
    /**
     * In case the PFTrancheInvestor was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PFTrancheInvestorUpdateInput, PFTrancheInvestorUncheckedUpdateInput>
  }

  /**
   * PFTrancheInvestor delete
   */
  export type PFTrancheInvestorDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PFTrancheInvestor
     */
    select?: PFTrancheInvestorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PFTrancheInvestor
     */
    omit?: PFTrancheInvestorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PFTrancheInvestorInclude<ExtArgs> | null
    /**
     * Filter which PFTrancheInvestor to delete.
     */
    where: PFTrancheInvestorWhereUniqueInput
  }

  /**
   * PFTrancheInvestor deleteMany
   */
  export type PFTrancheInvestorDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PFTrancheInvestors to delete
     */
    where?: PFTrancheInvestorWhereInput
    /**
     * Limit how many PFTrancheInvestors to delete.
     */
    limit?: number
  }

  /**
   * PFTrancheInvestor without action
   */
  export type PFTrancheInvestorDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PFTrancheInvestor
     */
    select?: PFTrancheInvestorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PFTrancheInvestor
     */
    omit?: PFTrancheInvestorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PFTrancheInvestorInclude<ExtArgs> | null
  }


  /**
   * Model WaterfallTier
   */

  export type AggregateWaterfallTier = {
    _count: WaterfallTierCountAggregateOutputType | null
    _avg: WaterfallTierAvgAggregateOutputType | null
    _sum: WaterfallTierSumAggregateOutputType | null
    _min: WaterfallTierMinAggregateOutputType | null
    _max: WaterfallTierMaxAggregateOutputType | null
  }

  export type WaterfallTierAvgAggregateOutputType = {
    priority: number | null
    amountCap: number | null
    percentage: number | null
    multiplier: number | null
  }

  export type WaterfallTierSumAggregateOutputType = {
    priority: number | null
    amountCap: number | null
    percentage: number | null
    multiplier: number | null
  }

  export type WaterfallTierMinAggregateOutputType = {
    id: string | null
    spcId: string | null
    priority: number | null
    name: string | null
    type: $Enums.TierType | null
    trancheId: string | null
    amountCap: number | null
    percentage: number | null
    multiplier: number | null
    description: string | null
  }

  export type WaterfallTierMaxAggregateOutputType = {
    id: string | null
    spcId: string | null
    priority: number | null
    name: string | null
    type: $Enums.TierType | null
    trancheId: string | null
    amountCap: number | null
    percentage: number | null
    multiplier: number | null
    description: string | null
  }

  export type WaterfallTierCountAggregateOutputType = {
    id: number
    spcId: number
    priority: number
    name: number
    type: number
    trancheId: number
    amountCap: number
    percentage: number
    multiplier: number
    description: number
    _all: number
  }


  export type WaterfallTierAvgAggregateInputType = {
    priority?: true
    amountCap?: true
    percentage?: true
    multiplier?: true
  }

  export type WaterfallTierSumAggregateInputType = {
    priority?: true
    amountCap?: true
    percentage?: true
    multiplier?: true
  }

  export type WaterfallTierMinAggregateInputType = {
    id?: true
    spcId?: true
    priority?: true
    name?: true
    type?: true
    trancheId?: true
    amountCap?: true
    percentage?: true
    multiplier?: true
    description?: true
  }

  export type WaterfallTierMaxAggregateInputType = {
    id?: true
    spcId?: true
    priority?: true
    name?: true
    type?: true
    trancheId?: true
    amountCap?: true
    percentage?: true
    multiplier?: true
    description?: true
  }

  export type WaterfallTierCountAggregateInputType = {
    id?: true
    spcId?: true
    priority?: true
    name?: true
    type?: true
    trancheId?: true
    amountCap?: true
    percentage?: true
    multiplier?: true
    description?: true
    _all?: true
  }

  export type WaterfallTierAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which WaterfallTier to aggregate.
     */
    where?: WaterfallTierWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WaterfallTiers to fetch.
     */
    orderBy?: WaterfallTierOrderByWithRelationInput | WaterfallTierOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: WaterfallTierWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WaterfallTiers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WaterfallTiers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned WaterfallTiers
    **/
    _count?: true | WaterfallTierCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: WaterfallTierAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: WaterfallTierSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: WaterfallTierMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: WaterfallTierMaxAggregateInputType
  }

  export type GetWaterfallTierAggregateType<T extends WaterfallTierAggregateArgs> = {
        [P in keyof T & keyof AggregateWaterfallTier]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateWaterfallTier[P]>
      : GetScalarType<T[P], AggregateWaterfallTier[P]>
  }




  export type WaterfallTierGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: WaterfallTierWhereInput
    orderBy?: WaterfallTierOrderByWithAggregationInput | WaterfallTierOrderByWithAggregationInput[]
    by: WaterfallTierScalarFieldEnum[] | WaterfallTierScalarFieldEnum
    having?: WaterfallTierScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: WaterfallTierCountAggregateInputType | true
    _avg?: WaterfallTierAvgAggregateInputType
    _sum?: WaterfallTierSumAggregateInputType
    _min?: WaterfallTierMinAggregateInputType
    _max?: WaterfallTierMaxAggregateInputType
  }

  export type WaterfallTierGroupByOutputType = {
    id: string
    spcId: string
    priority: number
    name: string
    type: $Enums.TierType
    trancheId: string | null
    amountCap: number | null
    percentage: number | null
    multiplier: number | null
    description: string | null
    _count: WaterfallTierCountAggregateOutputType | null
    _avg: WaterfallTierAvgAggregateOutputType | null
    _sum: WaterfallTierSumAggregateOutputType | null
    _min: WaterfallTierMinAggregateOutputType | null
    _max: WaterfallTierMaxAggregateOutputType | null
  }

  type GetWaterfallTierGroupByPayload<T extends WaterfallTierGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<WaterfallTierGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof WaterfallTierGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], WaterfallTierGroupByOutputType[P]>
            : GetScalarType<T[P], WaterfallTierGroupByOutputType[P]>
        }
      >
    >


  export type WaterfallTierSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    spcId?: boolean
    priority?: boolean
    name?: boolean
    type?: boolean
    trancheId?: boolean
    amountCap?: boolean
    percentage?: boolean
    multiplier?: boolean
    description?: boolean
    spc?: boolean | SPCDefaultArgs<ExtArgs>
    tranche?: boolean | WaterfallTier$trancheArgs<ExtArgs>
  }, ExtArgs["result"]["waterfallTier"]>

  export type WaterfallTierSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    spcId?: boolean
    priority?: boolean
    name?: boolean
    type?: boolean
    trancheId?: boolean
    amountCap?: boolean
    percentage?: boolean
    multiplier?: boolean
    description?: boolean
    spc?: boolean | SPCDefaultArgs<ExtArgs>
    tranche?: boolean | WaterfallTier$trancheArgs<ExtArgs>
  }, ExtArgs["result"]["waterfallTier"]>

  export type WaterfallTierSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    spcId?: boolean
    priority?: boolean
    name?: boolean
    type?: boolean
    trancheId?: boolean
    amountCap?: boolean
    percentage?: boolean
    multiplier?: boolean
    description?: boolean
    spc?: boolean | SPCDefaultArgs<ExtArgs>
    tranche?: boolean | WaterfallTier$trancheArgs<ExtArgs>
  }, ExtArgs["result"]["waterfallTier"]>

  export type WaterfallTierSelectScalar = {
    id?: boolean
    spcId?: boolean
    priority?: boolean
    name?: boolean
    type?: boolean
    trancheId?: boolean
    amountCap?: boolean
    percentage?: boolean
    multiplier?: boolean
    description?: boolean
  }

  export type WaterfallTierOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "spcId" | "priority" | "name" | "type" | "trancheId" | "amountCap" | "percentage" | "multiplier" | "description", ExtArgs["result"]["waterfallTier"]>
  export type WaterfallTierInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    spc?: boolean | SPCDefaultArgs<ExtArgs>
    tranche?: boolean | WaterfallTier$trancheArgs<ExtArgs>
  }
  export type WaterfallTierIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    spc?: boolean | SPCDefaultArgs<ExtArgs>
    tranche?: boolean | WaterfallTier$trancheArgs<ExtArgs>
  }
  export type WaterfallTierIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    spc?: boolean | SPCDefaultArgs<ExtArgs>
    tranche?: boolean | WaterfallTier$trancheArgs<ExtArgs>
  }

  export type $WaterfallTierPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "WaterfallTier"
    objects: {
      spc: Prisma.$SPCPayload<ExtArgs>
      /**
       * 분배 대상 트란쉐 (null이면 전체)
       */
      tranche: Prisma.$PFTranchePayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      spcId: string
      /**
       * 우선순위 (1이 최우선)
       */
      priority: number
      name: string
      /**
       * loan_repayment | preferred_return | equity_split | expense_recovery | revenue_share
       */
      type: $Enums.TierType
      trancheId: string | null
      /**
       * 이 티어의 분배 상한 (만원) — null이면 무제한
       */
      amountCap: number | null
      /**
       * 잔여 수익에서 이 티어가 가져가는 비율 % (equity_split 등에 사용)
       */
      percentage: number | null
      /**
       * 적용 배율 (원금의 N배까지) — preferred_return에 활용
       */
      multiplier: number | null
      description: string | null
    }, ExtArgs["result"]["waterfallTier"]>
    composites: {}
  }

  type WaterfallTierGetPayload<S extends boolean | null | undefined | WaterfallTierDefaultArgs> = $Result.GetResult<Prisma.$WaterfallTierPayload, S>

  type WaterfallTierCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<WaterfallTierFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: WaterfallTierCountAggregateInputType | true
    }

  export interface WaterfallTierDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['WaterfallTier'], meta: { name: 'WaterfallTier' } }
    /**
     * Find zero or one WaterfallTier that matches the filter.
     * @param {WaterfallTierFindUniqueArgs} args - Arguments to find a WaterfallTier
     * @example
     * // Get one WaterfallTier
     * const waterfallTier = await prisma.waterfallTier.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends WaterfallTierFindUniqueArgs>(args: SelectSubset<T, WaterfallTierFindUniqueArgs<ExtArgs>>): Prisma__WaterfallTierClient<$Result.GetResult<Prisma.$WaterfallTierPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one WaterfallTier that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {WaterfallTierFindUniqueOrThrowArgs} args - Arguments to find a WaterfallTier
     * @example
     * // Get one WaterfallTier
     * const waterfallTier = await prisma.waterfallTier.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends WaterfallTierFindUniqueOrThrowArgs>(args: SelectSubset<T, WaterfallTierFindUniqueOrThrowArgs<ExtArgs>>): Prisma__WaterfallTierClient<$Result.GetResult<Prisma.$WaterfallTierPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first WaterfallTier that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WaterfallTierFindFirstArgs} args - Arguments to find a WaterfallTier
     * @example
     * // Get one WaterfallTier
     * const waterfallTier = await prisma.waterfallTier.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends WaterfallTierFindFirstArgs>(args?: SelectSubset<T, WaterfallTierFindFirstArgs<ExtArgs>>): Prisma__WaterfallTierClient<$Result.GetResult<Prisma.$WaterfallTierPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first WaterfallTier that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WaterfallTierFindFirstOrThrowArgs} args - Arguments to find a WaterfallTier
     * @example
     * // Get one WaterfallTier
     * const waterfallTier = await prisma.waterfallTier.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends WaterfallTierFindFirstOrThrowArgs>(args?: SelectSubset<T, WaterfallTierFindFirstOrThrowArgs<ExtArgs>>): Prisma__WaterfallTierClient<$Result.GetResult<Prisma.$WaterfallTierPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more WaterfallTiers that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WaterfallTierFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all WaterfallTiers
     * const waterfallTiers = await prisma.waterfallTier.findMany()
     * 
     * // Get first 10 WaterfallTiers
     * const waterfallTiers = await prisma.waterfallTier.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const waterfallTierWithIdOnly = await prisma.waterfallTier.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends WaterfallTierFindManyArgs>(args?: SelectSubset<T, WaterfallTierFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WaterfallTierPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a WaterfallTier.
     * @param {WaterfallTierCreateArgs} args - Arguments to create a WaterfallTier.
     * @example
     * // Create one WaterfallTier
     * const WaterfallTier = await prisma.waterfallTier.create({
     *   data: {
     *     // ... data to create a WaterfallTier
     *   }
     * })
     * 
     */
    create<T extends WaterfallTierCreateArgs>(args: SelectSubset<T, WaterfallTierCreateArgs<ExtArgs>>): Prisma__WaterfallTierClient<$Result.GetResult<Prisma.$WaterfallTierPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many WaterfallTiers.
     * @param {WaterfallTierCreateManyArgs} args - Arguments to create many WaterfallTiers.
     * @example
     * // Create many WaterfallTiers
     * const waterfallTier = await prisma.waterfallTier.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends WaterfallTierCreateManyArgs>(args?: SelectSubset<T, WaterfallTierCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many WaterfallTiers and returns the data saved in the database.
     * @param {WaterfallTierCreateManyAndReturnArgs} args - Arguments to create many WaterfallTiers.
     * @example
     * // Create many WaterfallTiers
     * const waterfallTier = await prisma.waterfallTier.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many WaterfallTiers and only return the `id`
     * const waterfallTierWithIdOnly = await prisma.waterfallTier.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends WaterfallTierCreateManyAndReturnArgs>(args?: SelectSubset<T, WaterfallTierCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WaterfallTierPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a WaterfallTier.
     * @param {WaterfallTierDeleteArgs} args - Arguments to delete one WaterfallTier.
     * @example
     * // Delete one WaterfallTier
     * const WaterfallTier = await prisma.waterfallTier.delete({
     *   where: {
     *     // ... filter to delete one WaterfallTier
     *   }
     * })
     * 
     */
    delete<T extends WaterfallTierDeleteArgs>(args: SelectSubset<T, WaterfallTierDeleteArgs<ExtArgs>>): Prisma__WaterfallTierClient<$Result.GetResult<Prisma.$WaterfallTierPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one WaterfallTier.
     * @param {WaterfallTierUpdateArgs} args - Arguments to update one WaterfallTier.
     * @example
     * // Update one WaterfallTier
     * const waterfallTier = await prisma.waterfallTier.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends WaterfallTierUpdateArgs>(args: SelectSubset<T, WaterfallTierUpdateArgs<ExtArgs>>): Prisma__WaterfallTierClient<$Result.GetResult<Prisma.$WaterfallTierPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more WaterfallTiers.
     * @param {WaterfallTierDeleteManyArgs} args - Arguments to filter WaterfallTiers to delete.
     * @example
     * // Delete a few WaterfallTiers
     * const { count } = await prisma.waterfallTier.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends WaterfallTierDeleteManyArgs>(args?: SelectSubset<T, WaterfallTierDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more WaterfallTiers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WaterfallTierUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many WaterfallTiers
     * const waterfallTier = await prisma.waterfallTier.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends WaterfallTierUpdateManyArgs>(args: SelectSubset<T, WaterfallTierUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more WaterfallTiers and returns the data updated in the database.
     * @param {WaterfallTierUpdateManyAndReturnArgs} args - Arguments to update many WaterfallTiers.
     * @example
     * // Update many WaterfallTiers
     * const waterfallTier = await prisma.waterfallTier.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more WaterfallTiers and only return the `id`
     * const waterfallTierWithIdOnly = await prisma.waterfallTier.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends WaterfallTierUpdateManyAndReturnArgs>(args: SelectSubset<T, WaterfallTierUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WaterfallTierPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one WaterfallTier.
     * @param {WaterfallTierUpsertArgs} args - Arguments to update or create a WaterfallTier.
     * @example
     * // Update or create a WaterfallTier
     * const waterfallTier = await prisma.waterfallTier.upsert({
     *   create: {
     *     // ... data to create a WaterfallTier
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the WaterfallTier we want to update
     *   }
     * })
     */
    upsert<T extends WaterfallTierUpsertArgs>(args: SelectSubset<T, WaterfallTierUpsertArgs<ExtArgs>>): Prisma__WaterfallTierClient<$Result.GetResult<Prisma.$WaterfallTierPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of WaterfallTiers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WaterfallTierCountArgs} args - Arguments to filter WaterfallTiers to count.
     * @example
     * // Count the number of WaterfallTiers
     * const count = await prisma.waterfallTier.count({
     *   where: {
     *     // ... the filter for the WaterfallTiers we want to count
     *   }
     * })
    **/
    count<T extends WaterfallTierCountArgs>(
      args?: Subset<T, WaterfallTierCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], WaterfallTierCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a WaterfallTier.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WaterfallTierAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends WaterfallTierAggregateArgs>(args: Subset<T, WaterfallTierAggregateArgs>): Prisma.PrismaPromise<GetWaterfallTierAggregateType<T>>

    /**
     * Group by WaterfallTier.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WaterfallTierGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends WaterfallTierGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: WaterfallTierGroupByArgs['orderBy'] }
        : { orderBy?: WaterfallTierGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, WaterfallTierGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetWaterfallTierGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the WaterfallTier model
   */
  readonly fields: WaterfallTierFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for WaterfallTier.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__WaterfallTierClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    spc<T extends SPCDefaultArgs<ExtArgs> = {}>(args?: Subset<T, SPCDefaultArgs<ExtArgs>>): Prisma__SPCClient<$Result.GetResult<Prisma.$SPCPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    tranche<T extends WaterfallTier$trancheArgs<ExtArgs> = {}>(args?: Subset<T, WaterfallTier$trancheArgs<ExtArgs>>): Prisma__PFTrancheClient<$Result.GetResult<Prisma.$PFTranchePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the WaterfallTier model
   */
  interface WaterfallTierFieldRefs {
    readonly id: FieldRef<"WaterfallTier", 'String'>
    readonly spcId: FieldRef<"WaterfallTier", 'String'>
    readonly priority: FieldRef<"WaterfallTier", 'Int'>
    readonly name: FieldRef<"WaterfallTier", 'String'>
    readonly type: FieldRef<"WaterfallTier", 'TierType'>
    readonly trancheId: FieldRef<"WaterfallTier", 'String'>
    readonly amountCap: FieldRef<"WaterfallTier", 'Int'>
    readonly percentage: FieldRef<"WaterfallTier", 'Float'>
    readonly multiplier: FieldRef<"WaterfallTier", 'Float'>
    readonly description: FieldRef<"WaterfallTier", 'String'>
  }
    

  // Custom InputTypes
  /**
   * WaterfallTier findUnique
   */
  export type WaterfallTierFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WaterfallTier
     */
    select?: WaterfallTierSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WaterfallTier
     */
    omit?: WaterfallTierOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WaterfallTierInclude<ExtArgs> | null
    /**
     * Filter, which WaterfallTier to fetch.
     */
    where: WaterfallTierWhereUniqueInput
  }

  /**
   * WaterfallTier findUniqueOrThrow
   */
  export type WaterfallTierFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WaterfallTier
     */
    select?: WaterfallTierSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WaterfallTier
     */
    omit?: WaterfallTierOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WaterfallTierInclude<ExtArgs> | null
    /**
     * Filter, which WaterfallTier to fetch.
     */
    where: WaterfallTierWhereUniqueInput
  }

  /**
   * WaterfallTier findFirst
   */
  export type WaterfallTierFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WaterfallTier
     */
    select?: WaterfallTierSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WaterfallTier
     */
    omit?: WaterfallTierOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WaterfallTierInclude<ExtArgs> | null
    /**
     * Filter, which WaterfallTier to fetch.
     */
    where?: WaterfallTierWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WaterfallTiers to fetch.
     */
    orderBy?: WaterfallTierOrderByWithRelationInput | WaterfallTierOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for WaterfallTiers.
     */
    cursor?: WaterfallTierWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WaterfallTiers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WaterfallTiers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of WaterfallTiers.
     */
    distinct?: WaterfallTierScalarFieldEnum | WaterfallTierScalarFieldEnum[]
  }

  /**
   * WaterfallTier findFirstOrThrow
   */
  export type WaterfallTierFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WaterfallTier
     */
    select?: WaterfallTierSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WaterfallTier
     */
    omit?: WaterfallTierOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WaterfallTierInclude<ExtArgs> | null
    /**
     * Filter, which WaterfallTier to fetch.
     */
    where?: WaterfallTierWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WaterfallTiers to fetch.
     */
    orderBy?: WaterfallTierOrderByWithRelationInput | WaterfallTierOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for WaterfallTiers.
     */
    cursor?: WaterfallTierWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WaterfallTiers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WaterfallTiers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of WaterfallTiers.
     */
    distinct?: WaterfallTierScalarFieldEnum | WaterfallTierScalarFieldEnum[]
  }

  /**
   * WaterfallTier findMany
   */
  export type WaterfallTierFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WaterfallTier
     */
    select?: WaterfallTierSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WaterfallTier
     */
    omit?: WaterfallTierOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WaterfallTierInclude<ExtArgs> | null
    /**
     * Filter, which WaterfallTiers to fetch.
     */
    where?: WaterfallTierWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WaterfallTiers to fetch.
     */
    orderBy?: WaterfallTierOrderByWithRelationInput | WaterfallTierOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing WaterfallTiers.
     */
    cursor?: WaterfallTierWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WaterfallTiers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WaterfallTiers.
     */
    skip?: number
    distinct?: WaterfallTierScalarFieldEnum | WaterfallTierScalarFieldEnum[]
  }

  /**
   * WaterfallTier create
   */
  export type WaterfallTierCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WaterfallTier
     */
    select?: WaterfallTierSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WaterfallTier
     */
    omit?: WaterfallTierOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WaterfallTierInclude<ExtArgs> | null
    /**
     * The data needed to create a WaterfallTier.
     */
    data: XOR<WaterfallTierCreateInput, WaterfallTierUncheckedCreateInput>
  }

  /**
   * WaterfallTier createMany
   */
  export type WaterfallTierCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many WaterfallTiers.
     */
    data: WaterfallTierCreateManyInput | WaterfallTierCreateManyInput[]
  }

  /**
   * WaterfallTier createManyAndReturn
   */
  export type WaterfallTierCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WaterfallTier
     */
    select?: WaterfallTierSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the WaterfallTier
     */
    omit?: WaterfallTierOmit<ExtArgs> | null
    /**
     * The data used to create many WaterfallTiers.
     */
    data: WaterfallTierCreateManyInput | WaterfallTierCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WaterfallTierIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * WaterfallTier update
   */
  export type WaterfallTierUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WaterfallTier
     */
    select?: WaterfallTierSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WaterfallTier
     */
    omit?: WaterfallTierOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WaterfallTierInclude<ExtArgs> | null
    /**
     * The data needed to update a WaterfallTier.
     */
    data: XOR<WaterfallTierUpdateInput, WaterfallTierUncheckedUpdateInput>
    /**
     * Choose, which WaterfallTier to update.
     */
    where: WaterfallTierWhereUniqueInput
  }

  /**
   * WaterfallTier updateMany
   */
  export type WaterfallTierUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update WaterfallTiers.
     */
    data: XOR<WaterfallTierUpdateManyMutationInput, WaterfallTierUncheckedUpdateManyInput>
    /**
     * Filter which WaterfallTiers to update
     */
    where?: WaterfallTierWhereInput
    /**
     * Limit how many WaterfallTiers to update.
     */
    limit?: number
  }

  /**
   * WaterfallTier updateManyAndReturn
   */
  export type WaterfallTierUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WaterfallTier
     */
    select?: WaterfallTierSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the WaterfallTier
     */
    omit?: WaterfallTierOmit<ExtArgs> | null
    /**
     * The data used to update WaterfallTiers.
     */
    data: XOR<WaterfallTierUpdateManyMutationInput, WaterfallTierUncheckedUpdateManyInput>
    /**
     * Filter which WaterfallTiers to update
     */
    where?: WaterfallTierWhereInput
    /**
     * Limit how many WaterfallTiers to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WaterfallTierIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * WaterfallTier upsert
   */
  export type WaterfallTierUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WaterfallTier
     */
    select?: WaterfallTierSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WaterfallTier
     */
    omit?: WaterfallTierOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WaterfallTierInclude<ExtArgs> | null
    /**
     * The filter to search for the WaterfallTier to update in case it exists.
     */
    where: WaterfallTierWhereUniqueInput
    /**
     * In case the WaterfallTier found by the `where` argument doesn't exist, create a new WaterfallTier with this data.
     */
    create: XOR<WaterfallTierCreateInput, WaterfallTierUncheckedCreateInput>
    /**
     * In case the WaterfallTier was found with the provided `where` argument, update it with this data.
     */
    update: XOR<WaterfallTierUpdateInput, WaterfallTierUncheckedUpdateInput>
  }

  /**
   * WaterfallTier delete
   */
  export type WaterfallTierDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WaterfallTier
     */
    select?: WaterfallTierSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WaterfallTier
     */
    omit?: WaterfallTierOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WaterfallTierInclude<ExtArgs> | null
    /**
     * Filter which WaterfallTier to delete.
     */
    where: WaterfallTierWhereUniqueInput
  }

  /**
   * WaterfallTier deleteMany
   */
  export type WaterfallTierDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which WaterfallTiers to delete
     */
    where?: WaterfallTierWhereInput
    /**
     * Limit how many WaterfallTiers to delete.
     */
    limit?: number
  }

  /**
   * WaterfallTier.tranche
   */
  export type WaterfallTier$trancheArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PFTranche
     */
    select?: PFTrancheSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PFTranche
     */
    omit?: PFTrancheOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PFTrancheInclude<ExtArgs> | null
    where?: PFTrancheWhereInput
  }

  /**
   * WaterfallTier without action
   */
  export type WaterfallTierDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WaterfallTier
     */
    select?: WaterfallTierSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WaterfallTier
     */
    omit?: WaterfallTierOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WaterfallTierInclude<ExtArgs> | null
  }


  /**
   * Model RevenueEvent
   */

  export type AggregateRevenueEvent = {
    _count: RevenueEventCountAggregateOutputType | null
    _avg: RevenueEventAvgAggregateOutputType | null
    _sum: RevenueEventSumAggregateOutputType | null
    _min: RevenueEventMinAggregateOutputType | null
    _max: RevenueEventMaxAggregateOutputType | null
  }

  export type RevenueEventAvgAggregateOutputType = {
    amount: number | null
  }

  export type RevenueEventSumAggregateOutputType = {
    amount: number | null
  }

  export type RevenueEventMinAggregateOutputType = {
    id: string | null
    spcId: string | null
    amount: number | null
    source: $Enums.RevenueSource | null
    eventDate: string | null
    notes: string | null
    distributionStatus: string | null
    createdAt: Date | null
  }

  export type RevenueEventMaxAggregateOutputType = {
    id: string | null
    spcId: string | null
    amount: number | null
    source: $Enums.RevenueSource | null
    eventDate: string | null
    notes: string | null
    distributionStatus: string | null
    createdAt: Date | null
  }

  export type RevenueEventCountAggregateOutputType = {
    id: number
    spcId: number
    amount: number
    source: number
    eventDate: number
    notes: number
    distributionStatus: number
    createdAt: number
    _all: number
  }


  export type RevenueEventAvgAggregateInputType = {
    amount?: true
  }

  export type RevenueEventSumAggregateInputType = {
    amount?: true
  }

  export type RevenueEventMinAggregateInputType = {
    id?: true
    spcId?: true
    amount?: true
    source?: true
    eventDate?: true
    notes?: true
    distributionStatus?: true
    createdAt?: true
  }

  export type RevenueEventMaxAggregateInputType = {
    id?: true
    spcId?: true
    amount?: true
    source?: true
    eventDate?: true
    notes?: true
    distributionStatus?: true
    createdAt?: true
  }

  export type RevenueEventCountAggregateInputType = {
    id?: true
    spcId?: true
    amount?: true
    source?: true
    eventDate?: true
    notes?: true
    distributionStatus?: true
    createdAt?: true
    _all?: true
  }

  export type RevenueEventAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which RevenueEvent to aggregate.
     */
    where?: RevenueEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RevenueEvents to fetch.
     */
    orderBy?: RevenueEventOrderByWithRelationInput | RevenueEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: RevenueEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RevenueEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RevenueEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned RevenueEvents
    **/
    _count?: true | RevenueEventCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: RevenueEventAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: RevenueEventSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: RevenueEventMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: RevenueEventMaxAggregateInputType
  }

  export type GetRevenueEventAggregateType<T extends RevenueEventAggregateArgs> = {
        [P in keyof T & keyof AggregateRevenueEvent]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateRevenueEvent[P]>
      : GetScalarType<T[P], AggregateRevenueEvent[P]>
  }




  export type RevenueEventGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RevenueEventWhereInput
    orderBy?: RevenueEventOrderByWithAggregationInput | RevenueEventOrderByWithAggregationInput[]
    by: RevenueEventScalarFieldEnum[] | RevenueEventScalarFieldEnum
    having?: RevenueEventScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: RevenueEventCountAggregateInputType | true
    _avg?: RevenueEventAvgAggregateInputType
    _sum?: RevenueEventSumAggregateInputType
    _min?: RevenueEventMinAggregateInputType
    _max?: RevenueEventMaxAggregateInputType
  }

  export type RevenueEventGroupByOutputType = {
    id: string
    spcId: string
    amount: number
    source: $Enums.RevenueSource
    eventDate: string
    notes: string | null
    distributionStatus: string
    createdAt: Date
    _count: RevenueEventCountAggregateOutputType | null
    _avg: RevenueEventAvgAggregateOutputType | null
    _sum: RevenueEventSumAggregateOutputType | null
    _min: RevenueEventMinAggregateOutputType | null
    _max: RevenueEventMaxAggregateOutputType | null
  }

  type GetRevenueEventGroupByPayload<T extends RevenueEventGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<RevenueEventGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof RevenueEventGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], RevenueEventGroupByOutputType[P]>
            : GetScalarType<T[P], RevenueEventGroupByOutputType[P]>
        }
      >
    >


  export type RevenueEventSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    spcId?: boolean
    amount?: boolean
    source?: boolean
    eventDate?: boolean
    notes?: boolean
    distributionStatus?: boolean
    createdAt?: boolean
    spc?: boolean | SPCDefaultArgs<ExtArgs>
    distributions?: boolean | RevenueEvent$distributionsArgs<ExtArgs>
    _count?: boolean | RevenueEventCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["revenueEvent"]>

  export type RevenueEventSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    spcId?: boolean
    amount?: boolean
    source?: boolean
    eventDate?: boolean
    notes?: boolean
    distributionStatus?: boolean
    createdAt?: boolean
    spc?: boolean | SPCDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["revenueEvent"]>

  export type RevenueEventSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    spcId?: boolean
    amount?: boolean
    source?: boolean
    eventDate?: boolean
    notes?: boolean
    distributionStatus?: boolean
    createdAt?: boolean
    spc?: boolean | SPCDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["revenueEvent"]>

  export type RevenueEventSelectScalar = {
    id?: boolean
    spcId?: boolean
    amount?: boolean
    source?: boolean
    eventDate?: boolean
    notes?: boolean
    distributionStatus?: boolean
    createdAt?: boolean
  }

  export type RevenueEventOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "spcId" | "amount" | "source" | "eventDate" | "notes" | "distributionStatus" | "createdAt", ExtArgs["result"]["revenueEvent"]>
  export type RevenueEventInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    spc?: boolean | SPCDefaultArgs<ExtArgs>
    distributions?: boolean | RevenueEvent$distributionsArgs<ExtArgs>
    _count?: boolean | RevenueEventCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type RevenueEventIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    spc?: boolean | SPCDefaultArgs<ExtArgs>
  }
  export type RevenueEventIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    spc?: boolean | SPCDefaultArgs<ExtArgs>
  }

  export type $RevenueEventPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "RevenueEvent"
    objects: {
      spc: Prisma.$SPCPayload<ExtArgs>
      distributions: Prisma.$WaterfallDistributionPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      spcId: string
      /**
       * 수익액 (만원)
       */
      amount: number
      /**
       * theatrical | streaming | overseas | broadcast | merchandise | other
       */
      source: $Enums.RevenueSource
      eventDate: string
      notes: string | null
      /**
       * pending | distributed
       */
      distributionStatus: string
      createdAt: Date
    }, ExtArgs["result"]["revenueEvent"]>
    composites: {}
  }

  type RevenueEventGetPayload<S extends boolean | null | undefined | RevenueEventDefaultArgs> = $Result.GetResult<Prisma.$RevenueEventPayload, S>

  type RevenueEventCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<RevenueEventFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: RevenueEventCountAggregateInputType | true
    }

  export interface RevenueEventDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['RevenueEvent'], meta: { name: 'RevenueEvent' } }
    /**
     * Find zero or one RevenueEvent that matches the filter.
     * @param {RevenueEventFindUniqueArgs} args - Arguments to find a RevenueEvent
     * @example
     * // Get one RevenueEvent
     * const revenueEvent = await prisma.revenueEvent.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends RevenueEventFindUniqueArgs>(args: SelectSubset<T, RevenueEventFindUniqueArgs<ExtArgs>>): Prisma__RevenueEventClient<$Result.GetResult<Prisma.$RevenueEventPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one RevenueEvent that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {RevenueEventFindUniqueOrThrowArgs} args - Arguments to find a RevenueEvent
     * @example
     * // Get one RevenueEvent
     * const revenueEvent = await prisma.revenueEvent.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends RevenueEventFindUniqueOrThrowArgs>(args: SelectSubset<T, RevenueEventFindUniqueOrThrowArgs<ExtArgs>>): Prisma__RevenueEventClient<$Result.GetResult<Prisma.$RevenueEventPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first RevenueEvent that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RevenueEventFindFirstArgs} args - Arguments to find a RevenueEvent
     * @example
     * // Get one RevenueEvent
     * const revenueEvent = await prisma.revenueEvent.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends RevenueEventFindFirstArgs>(args?: SelectSubset<T, RevenueEventFindFirstArgs<ExtArgs>>): Prisma__RevenueEventClient<$Result.GetResult<Prisma.$RevenueEventPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first RevenueEvent that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RevenueEventFindFirstOrThrowArgs} args - Arguments to find a RevenueEvent
     * @example
     * // Get one RevenueEvent
     * const revenueEvent = await prisma.revenueEvent.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends RevenueEventFindFirstOrThrowArgs>(args?: SelectSubset<T, RevenueEventFindFirstOrThrowArgs<ExtArgs>>): Prisma__RevenueEventClient<$Result.GetResult<Prisma.$RevenueEventPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more RevenueEvents that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RevenueEventFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all RevenueEvents
     * const revenueEvents = await prisma.revenueEvent.findMany()
     * 
     * // Get first 10 RevenueEvents
     * const revenueEvents = await prisma.revenueEvent.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const revenueEventWithIdOnly = await prisma.revenueEvent.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends RevenueEventFindManyArgs>(args?: SelectSubset<T, RevenueEventFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RevenueEventPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a RevenueEvent.
     * @param {RevenueEventCreateArgs} args - Arguments to create a RevenueEvent.
     * @example
     * // Create one RevenueEvent
     * const RevenueEvent = await prisma.revenueEvent.create({
     *   data: {
     *     // ... data to create a RevenueEvent
     *   }
     * })
     * 
     */
    create<T extends RevenueEventCreateArgs>(args: SelectSubset<T, RevenueEventCreateArgs<ExtArgs>>): Prisma__RevenueEventClient<$Result.GetResult<Prisma.$RevenueEventPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many RevenueEvents.
     * @param {RevenueEventCreateManyArgs} args - Arguments to create many RevenueEvents.
     * @example
     * // Create many RevenueEvents
     * const revenueEvent = await prisma.revenueEvent.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends RevenueEventCreateManyArgs>(args?: SelectSubset<T, RevenueEventCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many RevenueEvents and returns the data saved in the database.
     * @param {RevenueEventCreateManyAndReturnArgs} args - Arguments to create many RevenueEvents.
     * @example
     * // Create many RevenueEvents
     * const revenueEvent = await prisma.revenueEvent.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many RevenueEvents and only return the `id`
     * const revenueEventWithIdOnly = await prisma.revenueEvent.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends RevenueEventCreateManyAndReturnArgs>(args?: SelectSubset<T, RevenueEventCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RevenueEventPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a RevenueEvent.
     * @param {RevenueEventDeleteArgs} args - Arguments to delete one RevenueEvent.
     * @example
     * // Delete one RevenueEvent
     * const RevenueEvent = await prisma.revenueEvent.delete({
     *   where: {
     *     // ... filter to delete one RevenueEvent
     *   }
     * })
     * 
     */
    delete<T extends RevenueEventDeleteArgs>(args: SelectSubset<T, RevenueEventDeleteArgs<ExtArgs>>): Prisma__RevenueEventClient<$Result.GetResult<Prisma.$RevenueEventPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one RevenueEvent.
     * @param {RevenueEventUpdateArgs} args - Arguments to update one RevenueEvent.
     * @example
     * // Update one RevenueEvent
     * const revenueEvent = await prisma.revenueEvent.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends RevenueEventUpdateArgs>(args: SelectSubset<T, RevenueEventUpdateArgs<ExtArgs>>): Prisma__RevenueEventClient<$Result.GetResult<Prisma.$RevenueEventPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more RevenueEvents.
     * @param {RevenueEventDeleteManyArgs} args - Arguments to filter RevenueEvents to delete.
     * @example
     * // Delete a few RevenueEvents
     * const { count } = await prisma.revenueEvent.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends RevenueEventDeleteManyArgs>(args?: SelectSubset<T, RevenueEventDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more RevenueEvents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RevenueEventUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many RevenueEvents
     * const revenueEvent = await prisma.revenueEvent.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends RevenueEventUpdateManyArgs>(args: SelectSubset<T, RevenueEventUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more RevenueEvents and returns the data updated in the database.
     * @param {RevenueEventUpdateManyAndReturnArgs} args - Arguments to update many RevenueEvents.
     * @example
     * // Update many RevenueEvents
     * const revenueEvent = await prisma.revenueEvent.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more RevenueEvents and only return the `id`
     * const revenueEventWithIdOnly = await prisma.revenueEvent.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends RevenueEventUpdateManyAndReturnArgs>(args: SelectSubset<T, RevenueEventUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RevenueEventPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one RevenueEvent.
     * @param {RevenueEventUpsertArgs} args - Arguments to update or create a RevenueEvent.
     * @example
     * // Update or create a RevenueEvent
     * const revenueEvent = await prisma.revenueEvent.upsert({
     *   create: {
     *     // ... data to create a RevenueEvent
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the RevenueEvent we want to update
     *   }
     * })
     */
    upsert<T extends RevenueEventUpsertArgs>(args: SelectSubset<T, RevenueEventUpsertArgs<ExtArgs>>): Prisma__RevenueEventClient<$Result.GetResult<Prisma.$RevenueEventPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of RevenueEvents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RevenueEventCountArgs} args - Arguments to filter RevenueEvents to count.
     * @example
     * // Count the number of RevenueEvents
     * const count = await prisma.revenueEvent.count({
     *   where: {
     *     // ... the filter for the RevenueEvents we want to count
     *   }
     * })
    **/
    count<T extends RevenueEventCountArgs>(
      args?: Subset<T, RevenueEventCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], RevenueEventCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a RevenueEvent.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RevenueEventAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends RevenueEventAggregateArgs>(args: Subset<T, RevenueEventAggregateArgs>): Prisma.PrismaPromise<GetRevenueEventAggregateType<T>>

    /**
     * Group by RevenueEvent.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RevenueEventGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends RevenueEventGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: RevenueEventGroupByArgs['orderBy'] }
        : { orderBy?: RevenueEventGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, RevenueEventGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRevenueEventGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the RevenueEvent model
   */
  readonly fields: RevenueEventFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for RevenueEvent.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__RevenueEventClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    spc<T extends SPCDefaultArgs<ExtArgs> = {}>(args?: Subset<T, SPCDefaultArgs<ExtArgs>>): Prisma__SPCClient<$Result.GetResult<Prisma.$SPCPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    distributions<T extends RevenueEvent$distributionsArgs<ExtArgs> = {}>(args?: Subset<T, RevenueEvent$distributionsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WaterfallDistributionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the RevenueEvent model
   */
  interface RevenueEventFieldRefs {
    readonly id: FieldRef<"RevenueEvent", 'String'>
    readonly spcId: FieldRef<"RevenueEvent", 'String'>
    readonly amount: FieldRef<"RevenueEvent", 'Int'>
    readonly source: FieldRef<"RevenueEvent", 'RevenueSource'>
    readonly eventDate: FieldRef<"RevenueEvent", 'String'>
    readonly notes: FieldRef<"RevenueEvent", 'String'>
    readonly distributionStatus: FieldRef<"RevenueEvent", 'String'>
    readonly createdAt: FieldRef<"RevenueEvent", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * RevenueEvent findUnique
   */
  export type RevenueEventFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RevenueEvent
     */
    select?: RevenueEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RevenueEvent
     */
    omit?: RevenueEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RevenueEventInclude<ExtArgs> | null
    /**
     * Filter, which RevenueEvent to fetch.
     */
    where: RevenueEventWhereUniqueInput
  }

  /**
   * RevenueEvent findUniqueOrThrow
   */
  export type RevenueEventFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RevenueEvent
     */
    select?: RevenueEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RevenueEvent
     */
    omit?: RevenueEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RevenueEventInclude<ExtArgs> | null
    /**
     * Filter, which RevenueEvent to fetch.
     */
    where: RevenueEventWhereUniqueInput
  }

  /**
   * RevenueEvent findFirst
   */
  export type RevenueEventFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RevenueEvent
     */
    select?: RevenueEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RevenueEvent
     */
    omit?: RevenueEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RevenueEventInclude<ExtArgs> | null
    /**
     * Filter, which RevenueEvent to fetch.
     */
    where?: RevenueEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RevenueEvents to fetch.
     */
    orderBy?: RevenueEventOrderByWithRelationInput | RevenueEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for RevenueEvents.
     */
    cursor?: RevenueEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RevenueEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RevenueEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RevenueEvents.
     */
    distinct?: RevenueEventScalarFieldEnum | RevenueEventScalarFieldEnum[]
  }

  /**
   * RevenueEvent findFirstOrThrow
   */
  export type RevenueEventFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RevenueEvent
     */
    select?: RevenueEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RevenueEvent
     */
    omit?: RevenueEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RevenueEventInclude<ExtArgs> | null
    /**
     * Filter, which RevenueEvent to fetch.
     */
    where?: RevenueEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RevenueEvents to fetch.
     */
    orderBy?: RevenueEventOrderByWithRelationInput | RevenueEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for RevenueEvents.
     */
    cursor?: RevenueEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RevenueEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RevenueEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RevenueEvents.
     */
    distinct?: RevenueEventScalarFieldEnum | RevenueEventScalarFieldEnum[]
  }

  /**
   * RevenueEvent findMany
   */
  export type RevenueEventFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RevenueEvent
     */
    select?: RevenueEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RevenueEvent
     */
    omit?: RevenueEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RevenueEventInclude<ExtArgs> | null
    /**
     * Filter, which RevenueEvents to fetch.
     */
    where?: RevenueEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RevenueEvents to fetch.
     */
    orderBy?: RevenueEventOrderByWithRelationInput | RevenueEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing RevenueEvents.
     */
    cursor?: RevenueEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RevenueEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RevenueEvents.
     */
    skip?: number
    distinct?: RevenueEventScalarFieldEnum | RevenueEventScalarFieldEnum[]
  }

  /**
   * RevenueEvent create
   */
  export type RevenueEventCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RevenueEvent
     */
    select?: RevenueEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RevenueEvent
     */
    omit?: RevenueEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RevenueEventInclude<ExtArgs> | null
    /**
     * The data needed to create a RevenueEvent.
     */
    data: XOR<RevenueEventCreateInput, RevenueEventUncheckedCreateInput>
  }

  /**
   * RevenueEvent createMany
   */
  export type RevenueEventCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many RevenueEvents.
     */
    data: RevenueEventCreateManyInput | RevenueEventCreateManyInput[]
  }

  /**
   * RevenueEvent createManyAndReturn
   */
  export type RevenueEventCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RevenueEvent
     */
    select?: RevenueEventSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the RevenueEvent
     */
    omit?: RevenueEventOmit<ExtArgs> | null
    /**
     * The data used to create many RevenueEvents.
     */
    data: RevenueEventCreateManyInput | RevenueEventCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RevenueEventIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * RevenueEvent update
   */
  export type RevenueEventUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RevenueEvent
     */
    select?: RevenueEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RevenueEvent
     */
    omit?: RevenueEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RevenueEventInclude<ExtArgs> | null
    /**
     * The data needed to update a RevenueEvent.
     */
    data: XOR<RevenueEventUpdateInput, RevenueEventUncheckedUpdateInput>
    /**
     * Choose, which RevenueEvent to update.
     */
    where: RevenueEventWhereUniqueInput
  }

  /**
   * RevenueEvent updateMany
   */
  export type RevenueEventUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update RevenueEvents.
     */
    data: XOR<RevenueEventUpdateManyMutationInput, RevenueEventUncheckedUpdateManyInput>
    /**
     * Filter which RevenueEvents to update
     */
    where?: RevenueEventWhereInput
    /**
     * Limit how many RevenueEvents to update.
     */
    limit?: number
  }

  /**
   * RevenueEvent updateManyAndReturn
   */
  export type RevenueEventUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RevenueEvent
     */
    select?: RevenueEventSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the RevenueEvent
     */
    omit?: RevenueEventOmit<ExtArgs> | null
    /**
     * The data used to update RevenueEvents.
     */
    data: XOR<RevenueEventUpdateManyMutationInput, RevenueEventUncheckedUpdateManyInput>
    /**
     * Filter which RevenueEvents to update
     */
    where?: RevenueEventWhereInput
    /**
     * Limit how many RevenueEvents to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RevenueEventIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * RevenueEvent upsert
   */
  export type RevenueEventUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RevenueEvent
     */
    select?: RevenueEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RevenueEvent
     */
    omit?: RevenueEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RevenueEventInclude<ExtArgs> | null
    /**
     * The filter to search for the RevenueEvent to update in case it exists.
     */
    where: RevenueEventWhereUniqueInput
    /**
     * In case the RevenueEvent found by the `where` argument doesn't exist, create a new RevenueEvent with this data.
     */
    create: XOR<RevenueEventCreateInput, RevenueEventUncheckedCreateInput>
    /**
     * In case the RevenueEvent was found with the provided `where` argument, update it with this data.
     */
    update: XOR<RevenueEventUpdateInput, RevenueEventUncheckedUpdateInput>
  }

  /**
   * RevenueEvent delete
   */
  export type RevenueEventDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RevenueEvent
     */
    select?: RevenueEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RevenueEvent
     */
    omit?: RevenueEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RevenueEventInclude<ExtArgs> | null
    /**
     * Filter which RevenueEvent to delete.
     */
    where: RevenueEventWhereUniqueInput
  }

  /**
   * RevenueEvent deleteMany
   */
  export type RevenueEventDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which RevenueEvents to delete
     */
    where?: RevenueEventWhereInput
    /**
     * Limit how many RevenueEvents to delete.
     */
    limit?: number
  }

  /**
   * RevenueEvent.distributions
   */
  export type RevenueEvent$distributionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WaterfallDistribution
     */
    select?: WaterfallDistributionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WaterfallDistribution
     */
    omit?: WaterfallDistributionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WaterfallDistributionInclude<ExtArgs> | null
    where?: WaterfallDistributionWhereInput
    orderBy?: WaterfallDistributionOrderByWithRelationInput | WaterfallDistributionOrderByWithRelationInput[]
    cursor?: WaterfallDistributionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: WaterfallDistributionScalarFieldEnum | WaterfallDistributionScalarFieldEnum[]
  }

  /**
   * RevenueEvent without action
   */
  export type RevenueEventDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RevenueEvent
     */
    select?: RevenueEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RevenueEvent
     */
    omit?: RevenueEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RevenueEventInclude<ExtArgs> | null
  }


  /**
   * Model WaterfallDistribution
   */

  export type AggregateWaterfallDistribution = {
    _count: WaterfallDistributionCountAggregateOutputType | null
    _avg: WaterfallDistributionAvgAggregateOutputType | null
    _sum: WaterfallDistributionSumAggregateOutputType | null
    _min: WaterfallDistributionMinAggregateOutputType | null
    _max: WaterfallDistributionMaxAggregateOutputType | null
  }

  export type WaterfallDistributionAvgAggregateOutputType = {
    tierPriority: number | null
    allocatedAmount: number | null
    cumulativePaid: number | null
  }

  export type WaterfallDistributionSumAggregateOutputType = {
    tierPriority: number | null
    allocatedAmount: number | null
    cumulativePaid: number | null
  }

  export type WaterfallDistributionMinAggregateOutputType = {
    id: string | null
    eventId: string | null
    tierId: string | null
    tierName: string | null
    tierPriority: number | null
    allocatedAmount: number | null
    cumulativePaid: number | null
    isFullySatisfied: boolean | null
    calculatedAt: Date | null
  }

  export type WaterfallDistributionMaxAggregateOutputType = {
    id: string | null
    eventId: string | null
    tierId: string | null
    tierName: string | null
    tierPriority: number | null
    allocatedAmount: number | null
    cumulativePaid: number | null
    isFullySatisfied: boolean | null
    calculatedAt: Date | null
  }

  export type WaterfallDistributionCountAggregateOutputType = {
    id: number
    eventId: number
    tierId: number
    tierName: number
    tierPriority: number
    allocatedAmount: number
    cumulativePaid: number
    isFullySatisfied: number
    calculatedAt: number
    _all: number
  }


  export type WaterfallDistributionAvgAggregateInputType = {
    tierPriority?: true
    allocatedAmount?: true
    cumulativePaid?: true
  }

  export type WaterfallDistributionSumAggregateInputType = {
    tierPriority?: true
    allocatedAmount?: true
    cumulativePaid?: true
  }

  export type WaterfallDistributionMinAggregateInputType = {
    id?: true
    eventId?: true
    tierId?: true
    tierName?: true
    tierPriority?: true
    allocatedAmount?: true
    cumulativePaid?: true
    isFullySatisfied?: true
    calculatedAt?: true
  }

  export type WaterfallDistributionMaxAggregateInputType = {
    id?: true
    eventId?: true
    tierId?: true
    tierName?: true
    tierPriority?: true
    allocatedAmount?: true
    cumulativePaid?: true
    isFullySatisfied?: true
    calculatedAt?: true
  }

  export type WaterfallDistributionCountAggregateInputType = {
    id?: true
    eventId?: true
    tierId?: true
    tierName?: true
    tierPriority?: true
    allocatedAmount?: true
    cumulativePaid?: true
    isFullySatisfied?: true
    calculatedAt?: true
    _all?: true
  }

  export type WaterfallDistributionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which WaterfallDistribution to aggregate.
     */
    where?: WaterfallDistributionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WaterfallDistributions to fetch.
     */
    orderBy?: WaterfallDistributionOrderByWithRelationInput | WaterfallDistributionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: WaterfallDistributionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WaterfallDistributions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WaterfallDistributions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned WaterfallDistributions
    **/
    _count?: true | WaterfallDistributionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: WaterfallDistributionAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: WaterfallDistributionSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: WaterfallDistributionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: WaterfallDistributionMaxAggregateInputType
  }

  export type GetWaterfallDistributionAggregateType<T extends WaterfallDistributionAggregateArgs> = {
        [P in keyof T & keyof AggregateWaterfallDistribution]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateWaterfallDistribution[P]>
      : GetScalarType<T[P], AggregateWaterfallDistribution[P]>
  }




  export type WaterfallDistributionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: WaterfallDistributionWhereInput
    orderBy?: WaterfallDistributionOrderByWithAggregationInput | WaterfallDistributionOrderByWithAggregationInput[]
    by: WaterfallDistributionScalarFieldEnum[] | WaterfallDistributionScalarFieldEnum
    having?: WaterfallDistributionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: WaterfallDistributionCountAggregateInputType | true
    _avg?: WaterfallDistributionAvgAggregateInputType
    _sum?: WaterfallDistributionSumAggregateInputType
    _min?: WaterfallDistributionMinAggregateInputType
    _max?: WaterfallDistributionMaxAggregateInputType
  }

  export type WaterfallDistributionGroupByOutputType = {
    id: string
    eventId: string
    tierId: string
    tierName: string
    tierPriority: number
    allocatedAmount: number
    cumulativePaid: number
    isFullySatisfied: boolean
    calculatedAt: Date
    _count: WaterfallDistributionCountAggregateOutputType | null
    _avg: WaterfallDistributionAvgAggregateOutputType | null
    _sum: WaterfallDistributionSumAggregateOutputType | null
    _min: WaterfallDistributionMinAggregateOutputType | null
    _max: WaterfallDistributionMaxAggregateOutputType | null
  }

  type GetWaterfallDistributionGroupByPayload<T extends WaterfallDistributionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<WaterfallDistributionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof WaterfallDistributionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], WaterfallDistributionGroupByOutputType[P]>
            : GetScalarType<T[P], WaterfallDistributionGroupByOutputType[P]>
        }
      >
    >


  export type WaterfallDistributionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    eventId?: boolean
    tierId?: boolean
    tierName?: boolean
    tierPriority?: boolean
    allocatedAmount?: boolean
    cumulativePaid?: boolean
    isFullySatisfied?: boolean
    calculatedAt?: boolean
    event?: boolean | RevenueEventDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["waterfallDistribution"]>

  export type WaterfallDistributionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    eventId?: boolean
    tierId?: boolean
    tierName?: boolean
    tierPriority?: boolean
    allocatedAmount?: boolean
    cumulativePaid?: boolean
    isFullySatisfied?: boolean
    calculatedAt?: boolean
    event?: boolean | RevenueEventDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["waterfallDistribution"]>

  export type WaterfallDistributionSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    eventId?: boolean
    tierId?: boolean
    tierName?: boolean
    tierPriority?: boolean
    allocatedAmount?: boolean
    cumulativePaid?: boolean
    isFullySatisfied?: boolean
    calculatedAt?: boolean
    event?: boolean | RevenueEventDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["waterfallDistribution"]>

  export type WaterfallDistributionSelectScalar = {
    id?: boolean
    eventId?: boolean
    tierId?: boolean
    tierName?: boolean
    tierPriority?: boolean
    allocatedAmount?: boolean
    cumulativePaid?: boolean
    isFullySatisfied?: boolean
    calculatedAt?: boolean
  }

  export type WaterfallDistributionOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "eventId" | "tierId" | "tierName" | "tierPriority" | "allocatedAmount" | "cumulativePaid" | "isFullySatisfied" | "calculatedAt", ExtArgs["result"]["waterfallDistribution"]>
  export type WaterfallDistributionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    event?: boolean | RevenueEventDefaultArgs<ExtArgs>
  }
  export type WaterfallDistributionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    event?: boolean | RevenueEventDefaultArgs<ExtArgs>
  }
  export type WaterfallDistributionIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    event?: boolean | RevenueEventDefaultArgs<ExtArgs>
  }

  export type $WaterfallDistributionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "WaterfallDistribution"
    objects: {
      event: Prisma.$RevenueEventPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      eventId: string
      tierId: string
      tierName: string
      tierPriority: number
      allocatedAmount: number
      cumulativePaid: number
      isFullySatisfied: boolean
      calculatedAt: Date
    }, ExtArgs["result"]["waterfallDistribution"]>
    composites: {}
  }

  type WaterfallDistributionGetPayload<S extends boolean | null | undefined | WaterfallDistributionDefaultArgs> = $Result.GetResult<Prisma.$WaterfallDistributionPayload, S>

  type WaterfallDistributionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<WaterfallDistributionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: WaterfallDistributionCountAggregateInputType | true
    }

  export interface WaterfallDistributionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['WaterfallDistribution'], meta: { name: 'WaterfallDistribution' } }
    /**
     * Find zero or one WaterfallDistribution that matches the filter.
     * @param {WaterfallDistributionFindUniqueArgs} args - Arguments to find a WaterfallDistribution
     * @example
     * // Get one WaterfallDistribution
     * const waterfallDistribution = await prisma.waterfallDistribution.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends WaterfallDistributionFindUniqueArgs>(args: SelectSubset<T, WaterfallDistributionFindUniqueArgs<ExtArgs>>): Prisma__WaterfallDistributionClient<$Result.GetResult<Prisma.$WaterfallDistributionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one WaterfallDistribution that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {WaterfallDistributionFindUniqueOrThrowArgs} args - Arguments to find a WaterfallDistribution
     * @example
     * // Get one WaterfallDistribution
     * const waterfallDistribution = await prisma.waterfallDistribution.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends WaterfallDistributionFindUniqueOrThrowArgs>(args: SelectSubset<T, WaterfallDistributionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__WaterfallDistributionClient<$Result.GetResult<Prisma.$WaterfallDistributionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first WaterfallDistribution that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WaterfallDistributionFindFirstArgs} args - Arguments to find a WaterfallDistribution
     * @example
     * // Get one WaterfallDistribution
     * const waterfallDistribution = await prisma.waterfallDistribution.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends WaterfallDistributionFindFirstArgs>(args?: SelectSubset<T, WaterfallDistributionFindFirstArgs<ExtArgs>>): Prisma__WaterfallDistributionClient<$Result.GetResult<Prisma.$WaterfallDistributionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first WaterfallDistribution that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WaterfallDistributionFindFirstOrThrowArgs} args - Arguments to find a WaterfallDistribution
     * @example
     * // Get one WaterfallDistribution
     * const waterfallDistribution = await prisma.waterfallDistribution.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends WaterfallDistributionFindFirstOrThrowArgs>(args?: SelectSubset<T, WaterfallDistributionFindFirstOrThrowArgs<ExtArgs>>): Prisma__WaterfallDistributionClient<$Result.GetResult<Prisma.$WaterfallDistributionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more WaterfallDistributions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WaterfallDistributionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all WaterfallDistributions
     * const waterfallDistributions = await prisma.waterfallDistribution.findMany()
     * 
     * // Get first 10 WaterfallDistributions
     * const waterfallDistributions = await prisma.waterfallDistribution.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const waterfallDistributionWithIdOnly = await prisma.waterfallDistribution.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends WaterfallDistributionFindManyArgs>(args?: SelectSubset<T, WaterfallDistributionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WaterfallDistributionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a WaterfallDistribution.
     * @param {WaterfallDistributionCreateArgs} args - Arguments to create a WaterfallDistribution.
     * @example
     * // Create one WaterfallDistribution
     * const WaterfallDistribution = await prisma.waterfallDistribution.create({
     *   data: {
     *     // ... data to create a WaterfallDistribution
     *   }
     * })
     * 
     */
    create<T extends WaterfallDistributionCreateArgs>(args: SelectSubset<T, WaterfallDistributionCreateArgs<ExtArgs>>): Prisma__WaterfallDistributionClient<$Result.GetResult<Prisma.$WaterfallDistributionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many WaterfallDistributions.
     * @param {WaterfallDistributionCreateManyArgs} args - Arguments to create many WaterfallDistributions.
     * @example
     * // Create many WaterfallDistributions
     * const waterfallDistribution = await prisma.waterfallDistribution.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends WaterfallDistributionCreateManyArgs>(args?: SelectSubset<T, WaterfallDistributionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many WaterfallDistributions and returns the data saved in the database.
     * @param {WaterfallDistributionCreateManyAndReturnArgs} args - Arguments to create many WaterfallDistributions.
     * @example
     * // Create many WaterfallDistributions
     * const waterfallDistribution = await prisma.waterfallDistribution.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many WaterfallDistributions and only return the `id`
     * const waterfallDistributionWithIdOnly = await prisma.waterfallDistribution.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends WaterfallDistributionCreateManyAndReturnArgs>(args?: SelectSubset<T, WaterfallDistributionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WaterfallDistributionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a WaterfallDistribution.
     * @param {WaterfallDistributionDeleteArgs} args - Arguments to delete one WaterfallDistribution.
     * @example
     * // Delete one WaterfallDistribution
     * const WaterfallDistribution = await prisma.waterfallDistribution.delete({
     *   where: {
     *     // ... filter to delete one WaterfallDistribution
     *   }
     * })
     * 
     */
    delete<T extends WaterfallDistributionDeleteArgs>(args: SelectSubset<T, WaterfallDistributionDeleteArgs<ExtArgs>>): Prisma__WaterfallDistributionClient<$Result.GetResult<Prisma.$WaterfallDistributionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one WaterfallDistribution.
     * @param {WaterfallDistributionUpdateArgs} args - Arguments to update one WaterfallDistribution.
     * @example
     * // Update one WaterfallDistribution
     * const waterfallDistribution = await prisma.waterfallDistribution.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends WaterfallDistributionUpdateArgs>(args: SelectSubset<T, WaterfallDistributionUpdateArgs<ExtArgs>>): Prisma__WaterfallDistributionClient<$Result.GetResult<Prisma.$WaterfallDistributionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more WaterfallDistributions.
     * @param {WaterfallDistributionDeleteManyArgs} args - Arguments to filter WaterfallDistributions to delete.
     * @example
     * // Delete a few WaterfallDistributions
     * const { count } = await prisma.waterfallDistribution.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends WaterfallDistributionDeleteManyArgs>(args?: SelectSubset<T, WaterfallDistributionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more WaterfallDistributions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WaterfallDistributionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many WaterfallDistributions
     * const waterfallDistribution = await prisma.waterfallDistribution.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends WaterfallDistributionUpdateManyArgs>(args: SelectSubset<T, WaterfallDistributionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more WaterfallDistributions and returns the data updated in the database.
     * @param {WaterfallDistributionUpdateManyAndReturnArgs} args - Arguments to update many WaterfallDistributions.
     * @example
     * // Update many WaterfallDistributions
     * const waterfallDistribution = await prisma.waterfallDistribution.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more WaterfallDistributions and only return the `id`
     * const waterfallDistributionWithIdOnly = await prisma.waterfallDistribution.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends WaterfallDistributionUpdateManyAndReturnArgs>(args: SelectSubset<T, WaterfallDistributionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WaterfallDistributionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one WaterfallDistribution.
     * @param {WaterfallDistributionUpsertArgs} args - Arguments to update or create a WaterfallDistribution.
     * @example
     * // Update or create a WaterfallDistribution
     * const waterfallDistribution = await prisma.waterfallDistribution.upsert({
     *   create: {
     *     // ... data to create a WaterfallDistribution
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the WaterfallDistribution we want to update
     *   }
     * })
     */
    upsert<T extends WaterfallDistributionUpsertArgs>(args: SelectSubset<T, WaterfallDistributionUpsertArgs<ExtArgs>>): Prisma__WaterfallDistributionClient<$Result.GetResult<Prisma.$WaterfallDistributionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of WaterfallDistributions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WaterfallDistributionCountArgs} args - Arguments to filter WaterfallDistributions to count.
     * @example
     * // Count the number of WaterfallDistributions
     * const count = await prisma.waterfallDistribution.count({
     *   where: {
     *     // ... the filter for the WaterfallDistributions we want to count
     *   }
     * })
    **/
    count<T extends WaterfallDistributionCountArgs>(
      args?: Subset<T, WaterfallDistributionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], WaterfallDistributionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a WaterfallDistribution.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WaterfallDistributionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends WaterfallDistributionAggregateArgs>(args: Subset<T, WaterfallDistributionAggregateArgs>): Prisma.PrismaPromise<GetWaterfallDistributionAggregateType<T>>

    /**
     * Group by WaterfallDistribution.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WaterfallDistributionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends WaterfallDistributionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: WaterfallDistributionGroupByArgs['orderBy'] }
        : { orderBy?: WaterfallDistributionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, WaterfallDistributionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetWaterfallDistributionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the WaterfallDistribution model
   */
  readonly fields: WaterfallDistributionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for WaterfallDistribution.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__WaterfallDistributionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    event<T extends RevenueEventDefaultArgs<ExtArgs> = {}>(args?: Subset<T, RevenueEventDefaultArgs<ExtArgs>>): Prisma__RevenueEventClient<$Result.GetResult<Prisma.$RevenueEventPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the WaterfallDistribution model
   */
  interface WaterfallDistributionFieldRefs {
    readonly id: FieldRef<"WaterfallDistribution", 'String'>
    readonly eventId: FieldRef<"WaterfallDistribution", 'String'>
    readonly tierId: FieldRef<"WaterfallDistribution", 'String'>
    readonly tierName: FieldRef<"WaterfallDistribution", 'String'>
    readonly tierPriority: FieldRef<"WaterfallDistribution", 'Int'>
    readonly allocatedAmount: FieldRef<"WaterfallDistribution", 'Int'>
    readonly cumulativePaid: FieldRef<"WaterfallDistribution", 'Int'>
    readonly isFullySatisfied: FieldRef<"WaterfallDistribution", 'Boolean'>
    readonly calculatedAt: FieldRef<"WaterfallDistribution", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * WaterfallDistribution findUnique
   */
  export type WaterfallDistributionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WaterfallDistribution
     */
    select?: WaterfallDistributionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WaterfallDistribution
     */
    omit?: WaterfallDistributionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WaterfallDistributionInclude<ExtArgs> | null
    /**
     * Filter, which WaterfallDistribution to fetch.
     */
    where: WaterfallDistributionWhereUniqueInput
  }

  /**
   * WaterfallDistribution findUniqueOrThrow
   */
  export type WaterfallDistributionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WaterfallDistribution
     */
    select?: WaterfallDistributionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WaterfallDistribution
     */
    omit?: WaterfallDistributionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WaterfallDistributionInclude<ExtArgs> | null
    /**
     * Filter, which WaterfallDistribution to fetch.
     */
    where: WaterfallDistributionWhereUniqueInput
  }

  /**
   * WaterfallDistribution findFirst
   */
  export type WaterfallDistributionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WaterfallDistribution
     */
    select?: WaterfallDistributionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WaterfallDistribution
     */
    omit?: WaterfallDistributionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WaterfallDistributionInclude<ExtArgs> | null
    /**
     * Filter, which WaterfallDistribution to fetch.
     */
    where?: WaterfallDistributionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WaterfallDistributions to fetch.
     */
    orderBy?: WaterfallDistributionOrderByWithRelationInput | WaterfallDistributionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for WaterfallDistributions.
     */
    cursor?: WaterfallDistributionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WaterfallDistributions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WaterfallDistributions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of WaterfallDistributions.
     */
    distinct?: WaterfallDistributionScalarFieldEnum | WaterfallDistributionScalarFieldEnum[]
  }

  /**
   * WaterfallDistribution findFirstOrThrow
   */
  export type WaterfallDistributionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WaterfallDistribution
     */
    select?: WaterfallDistributionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WaterfallDistribution
     */
    omit?: WaterfallDistributionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WaterfallDistributionInclude<ExtArgs> | null
    /**
     * Filter, which WaterfallDistribution to fetch.
     */
    where?: WaterfallDistributionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WaterfallDistributions to fetch.
     */
    orderBy?: WaterfallDistributionOrderByWithRelationInput | WaterfallDistributionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for WaterfallDistributions.
     */
    cursor?: WaterfallDistributionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WaterfallDistributions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WaterfallDistributions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of WaterfallDistributions.
     */
    distinct?: WaterfallDistributionScalarFieldEnum | WaterfallDistributionScalarFieldEnum[]
  }

  /**
   * WaterfallDistribution findMany
   */
  export type WaterfallDistributionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WaterfallDistribution
     */
    select?: WaterfallDistributionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WaterfallDistribution
     */
    omit?: WaterfallDistributionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WaterfallDistributionInclude<ExtArgs> | null
    /**
     * Filter, which WaterfallDistributions to fetch.
     */
    where?: WaterfallDistributionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WaterfallDistributions to fetch.
     */
    orderBy?: WaterfallDistributionOrderByWithRelationInput | WaterfallDistributionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing WaterfallDistributions.
     */
    cursor?: WaterfallDistributionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WaterfallDistributions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WaterfallDistributions.
     */
    skip?: number
    distinct?: WaterfallDistributionScalarFieldEnum | WaterfallDistributionScalarFieldEnum[]
  }

  /**
   * WaterfallDistribution create
   */
  export type WaterfallDistributionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WaterfallDistribution
     */
    select?: WaterfallDistributionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WaterfallDistribution
     */
    omit?: WaterfallDistributionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WaterfallDistributionInclude<ExtArgs> | null
    /**
     * The data needed to create a WaterfallDistribution.
     */
    data: XOR<WaterfallDistributionCreateInput, WaterfallDistributionUncheckedCreateInput>
  }

  /**
   * WaterfallDistribution createMany
   */
  export type WaterfallDistributionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many WaterfallDistributions.
     */
    data: WaterfallDistributionCreateManyInput | WaterfallDistributionCreateManyInput[]
  }

  /**
   * WaterfallDistribution createManyAndReturn
   */
  export type WaterfallDistributionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WaterfallDistribution
     */
    select?: WaterfallDistributionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the WaterfallDistribution
     */
    omit?: WaterfallDistributionOmit<ExtArgs> | null
    /**
     * The data used to create many WaterfallDistributions.
     */
    data: WaterfallDistributionCreateManyInput | WaterfallDistributionCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WaterfallDistributionIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * WaterfallDistribution update
   */
  export type WaterfallDistributionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WaterfallDistribution
     */
    select?: WaterfallDistributionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WaterfallDistribution
     */
    omit?: WaterfallDistributionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WaterfallDistributionInclude<ExtArgs> | null
    /**
     * The data needed to update a WaterfallDistribution.
     */
    data: XOR<WaterfallDistributionUpdateInput, WaterfallDistributionUncheckedUpdateInput>
    /**
     * Choose, which WaterfallDistribution to update.
     */
    where: WaterfallDistributionWhereUniqueInput
  }

  /**
   * WaterfallDistribution updateMany
   */
  export type WaterfallDistributionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update WaterfallDistributions.
     */
    data: XOR<WaterfallDistributionUpdateManyMutationInput, WaterfallDistributionUncheckedUpdateManyInput>
    /**
     * Filter which WaterfallDistributions to update
     */
    where?: WaterfallDistributionWhereInput
    /**
     * Limit how many WaterfallDistributions to update.
     */
    limit?: number
  }

  /**
   * WaterfallDistribution updateManyAndReturn
   */
  export type WaterfallDistributionUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WaterfallDistribution
     */
    select?: WaterfallDistributionSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the WaterfallDistribution
     */
    omit?: WaterfallDistributionOmit<ExtArgs> | null
    /**
     * The data used to update WaterfallDistributions.
     */
    data: XOR<WaterfallDistributionUpdateManyMutationInput, WaterfallDistributionUncheckedUpdateManyInput>
    /**
     * Filter which WaterfallDistributions to update
     */
    where?: WaterfallDistributionWhereInput
    /**
     * Limit how many WaterfallDistributions to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WaterfallDistributionIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * WaterfallDistribution upsert
   */
  export type WaterfallDistributionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WaterfallDistribution
     */
    select?: WaterfallDistributionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WaterfallDistribution
     */
    omit?: WaterfallDistributionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WaterfallDistributionInclude<ExtArgs> | null
    /**
     * The filter to search for the WaterfallDistribution to update in case it exists.
     */
    where: WaterfallDistributionWhereUniqueInput
    /**
     * In case the WaterfallDistribution found by the `where` argument doesn't exist, create a new WaterfallDistribution with this data.
     */
    create: XOR<WaterfallDistributionCreateInput, WaterfallDistributionUncheckedCreateInput>
    /**
     * In case the WaterfallDistribution was found with the provided `where` argument, update it with this data.
     */
    update: XOR<WaterfallDistributionUpdateInput, WaterfallDistributionUncheckedUpdateInput>
  }

  /**
   * WaterfallDistribution delete
   */
  export type WaterfallDistributionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WaterfallDistribution
     */
    select?: WaterfallDistributionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WaterfallDistribution
     */
    omit?: WaterfallDistributionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WaterfallDistributionInclude<ExtArgs> | null
    /**
     * Filter which WaterfallDistribution to delete.
     */
    where: WaterfallDistributionWhereUniqueInput
  }

  /**
   * WaterfallDistribution deleteMany
   */
  export type WaterfallDistributionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which WaterfallDistributions to delete
     */
    where?: WaterfallDistributionWhereInput
    /**
     * Limit how many WaterfallDistributions to delete.
     */
    limit?: number
  }

  /**
   * WaterfallDistribution without action
   */
  export type WaterfallDistributionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WaterfallDistribution
     */
    select?: WaterfallDistributionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WaterfallDistribution
     */
    omit?: WaterfallDistributionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WaterfallDistributionInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const InvestorScalarFieldEnum: {
    id: 'id',
    name: 'name',
    nameEn: 'nameEn',
    type: 'type',
    tier: 'tier',
    status: 'status',
    country: 'country',
    region: 'region',
    contactName: 'contactName',
    contactEmail: 'contactEmail',
    contactPhone: 'contactPhone',
    investmentCapacity: 'investmentCapacity',
    minTicket: 'minTicket',
    maxTicket: 'maxTicket',
    preferredGenres: 'preferredGenres',
    preferredBudgetRange: 'preferredBudgetRange',
    pastInvestments: 'pastInvestments',
    notes: 'notes',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type InvestorScalarFieldEnum = (typeof InvestorScalarFieldEnum)[keyof typeof InvestorScalarFieldEnum]


  export const InvestorGroupScalarFieldEnum: {
    id: 'id',
    name: 'name',
    type: 'type',
    managingFirm: 'managingFirm',
    totalCommitment: 'totalCommitment',
    status: 'status',
    notes: 'notes',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type InvestorGroupScalarFieldEnum = (typeof InvestorGroupScalarFieldEnum)[keyof typeof InvestorGroupScalarFieldEnum]


  export const InvestorGroupMemberScalarFieldEnum: {
    id: 'id',
    groupId: 'groupId',
    investorId: 'investorId',
    commitment: 'commitment',
    role: 'role',
    joinedAt: 'joinedAt'
  };

  export type InvestorGroupMemberScalarFieldEnum = (typeof InvestorGroupMemberScalarFieldEnum)[keyof typeof InvestorGroupMemberScalarFieldEnum]


  export const FilmProjectScalarFieldEnum: {
    id: 'id',
    title: 'title',
    titleEn: 'titleEn',
    genre: 'genre',
    logline: 'logline',
    totalBudget: 'totalBudget',
    budgetBreakdown: 'budgetBreakdown',
    status: 'status',
    targetReleaseDate: 'targetReleaseDate',
    scriptId: 'scriptId',
    notes: 'notes',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type FilmProjectScalarFieldEnum = (typeof FilmProjectScalarFieldEnum)[keyof typeof FilmProjectScalarFieldEnum]


  export const SPCScalarFieldEnum: {
    id: 'id',
    projectId: 'projectId',
    name: 'name',
    legalType: 'legalType',
    registrationNumber: 'registrationNumber',
    incorporationDate: 'incorporationDate',
    totalCapital: 'totalCapital',
    totalBudget: 'totalBudget',
    raisedAmount: 'raisedAmount',
    status: 'status',
    notes: 'notes',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type SPCScalarFieldEnum = (typeof SPCScalarFieldEnum)[keyof typeof SPCScalarFieldEnum]


  export const PFTrancheScalarFieldEnum: {
    id: 'id',
    spcId: 'spcId',
    name: 'name',
    type: 'type',
    priority: 'priority',
    targetAmount: 'targetAmount',
    raisedAmount: 'raisedAmount',
    interestRate: 'interestRate',
    targetReturn: 'targetReturn',
    termMonths: 'termMonths',
    status: 'status',
    notes: 'notes',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type PFTrancheScalarFieldEnum = (typeof PFTrancheScalarFieldEnum)[keyof typeof PFTrancheScalarFieldEnum]


  export const PFTrancheInvestorScalarFieldEnum: {
    id: 'id',
    trancheId: 'trancheId',
    investorId: 'investorId',
    amount: 'amount',
    percentage: 'percentage',
    joinedAt: 'joinedAt',
    notes: 'notes'
  };

  export type PFTrancheInvestorScalarFieldEnum = (typeof PFTrancheInvestorScalarFieldEnum)[keyof typeof PFTrancheInvestorScalarFieldEnum]


  export const WaterfallTierScalarFieldEnum: {
    id: 'id',
    spcId: 'spcId',
    priority: 'priority',
    name: 'name',
    type: 'type',
    trancheId: 'trancheId',
    amountCap: 'amountCap',
    percentage: 'percentage',
    multiplier: 'multiplier',
    description: 'description'
  };

  export type WaterfallTierScalarFieldEnum = (typeof WaterfallTierScalarFieldEnum)[keyof typeof WaterfallTierScalarFieldEnum]


  export const RevenueEventScalarFieldEnum: {
    id: 'id',
    spcId: 'spcId',
    amount: 'amount',
    source: 'source',
    eventDate: 'eventDate',
    notes: 'notes',
    distributionStatus: 'distributionStatus',
    createdAt: 'createdAt'
  };

  export type RevenueEventScalarFieldEnum = (typeof RevenueEventScalarFieldEnum)[keyof typeof RevenueEventScalarFieldEnum]


  export const WaterfallDistributionScalarFieldEnum: {
    id: 'id',
    eventId: 'eventId',
    tierId: 'tierId',
    tierName: 'tierName',
    tierPriority: 'tierPriority',
    allocatedAmount: 'allocatedAmount',
    cumulativePaid: 'cumulativePaid',
    isFullySatisfied: 'isFullySatisfied',
    calculatedAt: 'calculatedAt'
  };

  export type WaterfallDistributionScalarFieldEnum = (typeof WaterfallDistributionScalarFieldEnum)[keyof typeof WaterfallDistributionScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'InvestorType'
   */
  export type EnumInvestorTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'InvestorType'>
    


  /**
   * Reference to a field of type 'InvestorTier'
   */
  export type EnumInvestorTierFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'InvestorTier'>
    


  /**
   * Reference to a field of type 'InvestorStatus'
   */
  export type EnumInvestorStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'InvestorStatus'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'InvestorGroupType'
   */
  export type EnumInvestorGroupTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'InvestorGroupType'>
    


  /**
   * Reference to a field of type 'InvestorGroupStatus'
   */
  export type EnumInvestorGroupStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'InvestorGroupStatus'>
    


  /**
   * Reference to a field of type 'ProjectStatus'
   */
  export type EnumProjectStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ProjectStatus'>
    


  /**
   * Reference to a field of type 'SPCLegalType'
   */
  export type EnumSPCLegalTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'SPCLegalType'>
    


  /**
   * Reference to a field of type 'SPCStatus'
   */
  export type EnumSPCStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'SPCStatus'>
    


  /**
   * Reference to a field of type 'TrancheType'
   */
  export type EnumTrancheTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TrancheType'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'TrancheStatus'
   */
  export type EnumTrancheStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TrancheStatus'>
    


  /**
   * Reference to a field of type 'TierType'
   */
  export type EnumTierTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TierType'>
    


  /**
   * Reference to a field of type 'RevenueSource'
   */
  export type EnumRevenueSourceFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'RevenueSource'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    
  /**
   * Deep Input Types
   */


  export type InvestorWhereInput = {
    AND?: InvestorWhereInput | InvestorWhereInput[]
    OR?: InvestorWhereInput[]
    NOT?: InvestorWhereInput | InvestorWhereInput[]
    id?: StringFilter<"Investor"> | string
    name?: StringFilter<"Investor"> | string
    nameEn?: StringNullableFilter<"Investor"> | string | null
    type?: EnumInvestorTypeFilter<"Investor"> | $Enums.InvestorType
    tier?: EnumInvestorTierFilter<"Investor"> | $Enums.InvestorTier
    status?: EnumInvestorStatusFilter<"Investor"> | $Enums.InvestorStatus
    country?: StringFilter<"Investor"> | string
    region?: StringNullableFilter<"Investor"> | string | null
    contactName?: StringNullableFilter<"Investor"> | string | null
    contactEmail?: StringNullableFilter<"Investor"> | string | null
    contactPhone?: StringNullableFilter<"Investor"> | string | null
    investmentCapacity?: IntNullableFilter<"Investor"> | number | null
    minTicket?: IntNullableFilter<"Investor"> | number | null
    maxTicket?: IntNullableFilter<"Investor"> | number | null
    preferredGenres?: StringFilter<"Investor"> | string
    preferredBudgetRange?: StringFilter<"Investor"> | string
    pastInvestments?: StringFilter<"Investor"> | string
    notes?: StringNullableFilter<"Investor"> | string | null
    createdAt?: DateTimeFilter<"Investor"> | Date | string
    updatedAt?: DateTimeFilter<"Investor"> | Date | string
    groupMemberships?: InvestorGroupMemberListRelationFilter
    tranchePositions?: PFTrancheInvestorListRelationFilter
  }

  export type InvestorOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    nameEn?: SortOrderInput | SortOrder
    type?: SortOrder
    tier?: SortOrder
    status?: SortOrder
    country?: SortOrder
    region?: SortOrderInput | SortOrder
    contactName?: SortOrderInput | SortOrder
    contactEmail?: SortOrderInput | SortOrder
    contactPhone?: SortOrderInput | SortOrder
    investmentCapacity?: SortOrderInput | SortOrder
    minTicket?: SortOrderInput | SortOrder
    maxTicket?: SortOrderInput | SortOrder
    preferredGenres?: SortOrder
    preferredBudgetRange?: SortOrder
    pastInvestments?: SortOrder
    notes?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    groupMemberships?: InvestorGroupMemberOrderByRelationAggregateInput
    tranchePositions?: PFTrancheInvestorOrderByRelationAggregateInput
  }

  export type InvestorWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: InvestorWhereInput | InvestorWhereInput[]
    OR?: InvestorWhereInput[]
    NOT?: InvestorWhereInput | InvestorWhereInput[]
    name?: StringFilter<"Investor"> | string
    nameEn?: StringNullableFilter<"Investor"> | string | null
    type?: EnumInvestorTypeFilter<"Investor"> | $Enums.InvestorType
    tier?: EnumInvestorTierFilter<"Investor"> | $Enums.InvestorTier
    status?: EnumInvestorStatusFilter<"Investor"> | $Enums.InvestorStatus
    country?: StringFilter<"Investor"> | string
    region?: StringNullableFilter<"Investor"> | string | null
    contactName?: StringNullableFilter<"Investor"> | string | null
    contactEmail?: StringNullableFilter<"Investor"> | string | null
    contactPhone?: StringNullableFilter<"Investor"> | string | null
    investmentCapacity?: IntNullableFilter<"Investor"> | number | null
    minTicket?: IntNullableFilter<"Investor"> | number | null
    maxTicket?: IntNullableFilter<"Investor"> | number | null
    preferredGenres?: StringFilter<"Investor"> | string
    preferredBudgetRange?: StringFilter<"Investor"> | string
    pastInvestments?: StringFilter<"Investor"> | string
    notes?: StringNullableFilter<"Investor"> | string | null
    createdAt?: DateTimeFilter<"Investor"> | Date | string
    updatedAt?: DateTimeFilter<"Investor"> | Date | string
    groupMemberships?: InvestorGroupMemberListRelationFilter
    tranchePositions?: PFTrancheInvestorListRelationFilter
  }, "id">

  export type InvestorOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    nameEn?: SortOrderInput | SortOrder
    type?: SortOrder
    tier?: SortOrder
    status?: SortOrder
    country?: SortOrder
    region?: SortOrderInput | SortOrder
    contactName?: SortOrderInput | SortOrder
    contactEmail?: SortOrderInput | SortOrder
    contactPhone?: SortOrderInput | SortOrder
    investmentCapacity?: SortOrderInput | SortOrder
    minTicket?: SortOrderInput | SortOrder
    maxTicket?: SortOrderInput | SortOrder
    preferredGenres?: SortOrder
    preferredBudgetRange?: SortOrder
    pastInvestments?: SortOrder
    notes?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: InvestorCountOrderByAggregateInput
    _avg?: InvestorAvgOrderByAggregateInput
    _max?: InvestorMaxOrderByAggregateInput
    _min?: InvestorMinOrderByAggregateInput
    _sum?: InvestorSumOrderByAggregateInput
  }

  export type InvestorScalarWhereWithAggregatesInput = {
    AND?: InvestorScalarWhereWithAggregatesInput | InvestorScalarWhereWithAggregatesInput[]
    OR?: InvestorScalarWhereWithAggregatesInput[]
    NOT?: InvestorScalarWhereWithAggregatesInput | InvestorScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Investor"> | string
    name?: StringWithAggregatesFilter<"Investor"> | string
    nameEn?: StringNullableWithAggregatesFilter<"Investor"> | string | null
    type?: EnumInvestorTypeWithAggregatesFilter<"Investor"> | $Enums.InvestorType
    tier?: EnumInvestorTierWithAggregatesFilter<"Investor"> | $Enums.InvestorTier
    status?: EnumInvestorStatusWithAggregatesFilter<"Investor"> | $Enums.InvestorStatus
    country?: StringWithAggregatesFilter<"Investor"> | string
    region?: StringNullableWithAggregatesFilter<"Investor"> | string | null
    contactName?: StringNullableWithAggregatesFilter<"Investor"> | string | null
    contactEmail?: StringNullableWithAggregatesFilter<"Investor"> | string | null
    contactPhone?: StringNullableWithAggregatesFilter<"Investor"> | string | null
    investmentCapacity?: IntNullableWithAggregatesFilter<"Investor"> | number | null
    minTicket?: IntNullableWithAggregatesFilter<"Investor"> | number | null
    maxTicket?: IntNullableWithAggregatesFilter<"Investor"> | number | null
    preferredGenres?: StringWithAggregatesFilter<"Investor"> | string
    preferredBudgetRange?: StringWithAggregatesFilter<"Investor"> | string
    pastInvestments?: StringWithAggregatesFilter<"Investor"> | string
    notes?: StringNullableWithAggregatesFilter<"Investor"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Investor"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Investor"> | Date | string
  }

  export type InvestorGroupWhereInput = {
    AND?: InvestorGroupWhereInput | InvestorGroupWhereInput[]
    OR?: InvestorGroupWhereInput[]
    NOT?: InvestorGroupWhereInput | InvestorGroupWhereInput[]
    id?: StringFilter<"InvestorGroup"> | string
    name?: StringFilter<"InvestorGroup"> | string
    type?: EnumInvestorGroupTypeFilter<"InvestorGroup"> | $Enums.InvestorGroupType
    managingFirm?: StringNullableFilter<"InvestorGroup"> | string | null
    totalCommitment?: IntNullableFilter<"InvestorGroup"> | number | null
    status?: EnumInvestorGroupStatusFilter<"InvestorGroup"> | $Enums.InvestorGroupStatus
    notes?: StringNullableFilter<"InvestorGroup"> | string | null
    createdAt?: DateTimeFilter<"InvestorGroup"> | Date | string
    updatedAt?: DateTimeFilter<"InvestorGroup"> | Date | string
    members?: InvestorGroupMemberListRelationFilter
  }

  export type InvestorGroupOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    type?: SortOrder
    managingFirm?: SortOrderInput | SortOrder
    totalCommitment?: SortOrderInput | SortOrder
    status?: SortOrder
    notes?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    members?: InvestorGroupMemberOrderByRelationAggregateInput
  }

  export type InvestorGroupWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    name?: string
    AND?: InvestorGroupWhereInput | InvestorGroupWhereInput[]
    OR?: InvestorGroupWhereInput[]
    NOT?: InvestorGroupWhereInput | InvestorGroupWhereInput[]
    type?: EnumInvestorGroupTypeFilter<"InvestorGroup"> | $Enums.InvestorGroupType
    managingFirm?: StringNullableFilter<"InvestorGroup"> | string | null
    totalCommitment?: IntNullableFilter<"InvestorGroup"> | number | null
    status?: EnumInvestorGroupStatusFilter<"InvestorGroup"> | $Enums.InvestorGroupStatus
    notes?: StringNullableFilter<"InvestorGroup"> | string | null
    createdAt?: DateTimeFilter<"InvestorGroup"> | Date | string
    updatedAt?: DateTimeFilter<"InvestorGroup"> | Date | string
    members?: InvestorGroupMemberListRelationFilter
  }, "id" | "name">

  export type InvestorGroupOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    type?: SortOrder
    managingFirm?: SortOrderInput | SortOrder
    totalCommitment?: SortOrderInput | SortOrder
    status?: SortOrder
    notes?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: InvestorGroupCountOrderByAggregateInput
    _avg?: InvestorGroupAvgOrderByAggregateInput
    _max?: InvestorGroupMaxOrderByAggregateInput
    _min?: InvestorGroupMinOrderByAggregateInput
    _sum?: InvestorGroupSumOrderByAggregateInput
  }

  export type InvestorGroupScalarWhereWithAggregatesInput = {
    AND?: InvestorGroupScalarWhereWithAggregatesInput | InvestorGroupScalarWhereWithAggregatesInput[]
    OR?: InvestorGroupScalarWhereWithAggregatesInput[]
    NOT?: InvestorGroupScalarWhereWithAggregatesInput | InvestorGroupScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"InvestorGroup"> | string
    name?: StringWithAggregatesFilter<"InvestorGroup"> | string
    type?: EnumInvestorGroupTypeWithAggregatesFilter<"InvestorGroup"> | $Enums.InvestorGroupType
    managingFirm?: StringNullableWithAggregatesFilter<"InvestorGroup"> | string | null
    totalCommitment?: IntNullableWithAggregatesFilter<"InvestorGroup"> | number | null
    status?: EnumInvestorGroupStatusWithAggregatesFilter<"InvestorGroup"> | $Enums.InvestorGroupStatus
    notes?: StringNullableWithAggregatesFilter<"InvestorGroup"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"InvestorGroup"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"InvestorGroup"> | Date | string
  }

  export type InvestorGroupMemberWhereInput = {
    AND?: InvestorGroupMemberWhereInput | InvestorGroupMemberWhereInput[]
    OR?: InvestorGroupMemberWhereInput[]
    NOT?: InvestorGroupMemberWhereInput | InvestorGroupMemberWhereInput[]
    id?: StringFilter<"InvestorGroupMember"> | string
    groupId?: StringFilter<"InvestorGroupMember"> | string
    investorId?: StringFilter<"InvestorGroupMember"> | string
    commitment?: IntNullableFilter<"InvestorGroupMember"> | number | null
    role?: StringFilter<"InvestorGroupMember"> | string
    joinedAt?: DateTimeFilter<"InvestorGroupMember"> | Date | string
    group?: XOR<InvestorGroupScalarRelationFilter, InvestorGroupWhereInput>
    investor?: XOR<InvestorScalarRelationFilter, InvestorWhereInput>
  }

  export type InvestorGroupMemberOrderByWithRelationInput = {
    id?: SortOrder
    groupId?: SortOrder
    investorId?: SortOrder
    commitment?: SortOrderInput | SortOrder
    role?: SortOrder
    joinedAt?: SortOrder
    group?: InvestorGroupOrderByWithRelationInput
    investor?: InvestorOrderByWithRelationInput
  }

  export type InvestorGroupMemberWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    groupId_investorId?: InvestorGroupMemberGroupIdInvestorIdCompoundUniqueInput
    AND?: InvestorGroupMemberWhereInput | InvestorGroupMemberWhereInput[]
    OR?: InvestorGroupMemberWhereInput[]
    NOT?: InvestorGroupMemberWhereInput | InvestorGroupMemberWhereInput[]
    groupId?: StringFilter<"InvestorGroupMember"> | string
    investorId?: StringFilter<"InvestorGroupMember"> | string
    commitment?: IntNullableFilter<"InvestorGroupMember"> | number | null
    role?: StringFilter<"InvestorGroupMember"> | string
    joinedAt?: DateTimeFilter<"InvestorGroupMember"> | Date | string
    group?: XOR<InvestorGroupScalarRelationFilter, InvestorGroupWhereInput>
    investor?: XOR<InvestorScalarRelationFilter, InvestorWhereInput>
  }, "id" | "groupId_investorId">

  export type InvestorGroupMemberOrderByWithAggregationInput = {
    id?: SortOrder
    groupId?: SortOrder
    investorId?: SortOrder
    commitment?: SortOrderInput | SortOrder
    role?: SortOrder
    joinedAt?: SortOrder
    _count?: InvestorGroupMemberCountOrderByAggregateInput
    _avg?: InvestorGroupMemberAvgOrderByAggregateInput
    _max?: InvestorGroupMemberMaxOrderByAggregateInput
    _min?: InvestorGroupMemberMinOrderByAggregateInput
    _sum?: InvestorGroupMemberSumOrderByAggregateInput
  }

  export type InvestorGroupMemberScalarWhereWithAggregatesInput = {
    AND?: InvestorGroupMemberScalarWhereWithAggregatesInput | InvestorGroupMemberScalarWhereWithAggregatesInput[]
    OR?: InvestorGroupMemberScalarWhereWithAggregatesInput[]
    NOT?: InvestorGroupMemberScalarWhereWithAggregatesInput | InvestorGroupMemberScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"InvestorGroupMember"> | string
    groupId?: StringWithAggregatesFilter<"InvestorGroupMember"> | string
    investorId?: StringWithAggregatesFilter<"InvestorGroupMember"> | string
    commitment?: IntNullableWithAggregatesFilter<"InvestorGroupMember"> | number | null
    role?: StringWithAggregatesFilter<"InvestorGroupMember"> | string
    joinedAt?: DateTimeWithAggregatesFilter<"InvestorGroupMember"> | Date | string
  }

  export type FilmProjectWhereInput = {
    AND?: FilmProjectWhereInput | FilmProjectWhereInput[]
    OR?: FilmProjectWhereInput[]
    NOT?: FilmProjectWhereInput | FilmProjectWhereInput[]
    id?: StringFilter<"FilmProject"> | string
    title?: StringFilter<"FilmProject"> | string
    titleEn?: StringNullableFilter<"FilmProject"> | string | null
    genre?: StringNullableFilter<"FilmProject"> | string | null
    logline?: StringNullableFilter<"FilmProject"> | string | null
    totalBudget?: IntNullableFilter<"FilmProject"> | number | null
    budgetBreakdown?: StringFilter<"FilmProject"> | string
    status?: EnumProjectStatusFilter<"FilmProject"> | $Enums.ProjectStatus
    targetReleaseDate?: StringNullableFilter<"FilmProject"> | string | null
    scriptId?: StringNullableFilter<"FilmProject"> | string | null
    notes?: StringNullableFilter<"FilmProject"> | string | null
    createdAt?: DateTimeFilter<"FilmProject"> | Date | string
    updatedAt?: DateTimeFilter<"FilmProject"> | Date | string
    spcs?: SPCListRelationFilter
  }

  export type FilmProjectOrderByWithRelationInput = {
    id?: SortOrder
    title?: SortOrder
    titleEn?: SortOrderInput | SortOrder
    genre?: SortOrderInput | SortOrder
    logline?: SortOrderInput | SortOrder
    totalBudget?: SortOrderInput | SortOrder
    budgetBreakdown?: SortOrder
    status?: SortOrder
    targetReleaseDate?: SortOrderInput | SortOrder
    scriptId?: SortOrderInput | SortOrder
    notes?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    spcs?: SPCOrderByRelationAggregateInput
  }

  export type FilmProjectWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: FilmProjectWhereInput | FilmProjectWhereInput[]
    OR?: FilmProjectWhereInput[]
    NOT?: FilmProjectWhereInput | FilmProjectWhereInput[]
    title?: StringFilter<"FilmProject"> | string
    titleEn?: StringNullableFilter<"FilmProject"> | string | null
    genre?: StringNullableFilter<"FilmProject"> | string | null
    logline?: StringNullableFilter<"FilmProject"> | string | null
    totalBudget?: IntNullableFilter<"FilmProject"> | number | null
    budgetBreakdown?: StringFilter<"FilmProject"> | string
    status?: EnumProjectStatusFilter<"FilmProject"> | $Enums.ProjectStatus
    targetReleaseDate?: StringNullableFilter<"FilmProject"> | string | null
    scriptId?: StringNullableFilter<"FilmProject"> | string | null
    notes?: StringNullableFilter<"FilmProject"> | string | null
    createdAt?: DateTimeFilter<"FilmProject"> | Date | string
    updatedAt?: DateTimeFilter<"FilmProject"> | Date | string
    spcs?: SPCListRelationFilter
  }, "id">

  export type FilmProjectOrderByWithAggregationInput = {
    id?: SortOrder
    title?: SortOrder
    titleEn?: SortOrderInput | SortOrder
    genre?: SortOrderInput | SortOrder
    logline?: SortOrderInput | SortOrder
    totalBudget?: SortOrderInput | SortOrder
    budgetBreakdown?: SortOrder
    status?: SortOrder
    targetReleaseDate?: SortOrderInput | SortOrder
    scriptId?: SortOrderInput | SortOrder
    notes?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: FilmProjectCountOrderByAggregateInput
    _avg?: FilmProjectAvgOrderByAggregateInput
    _max?: FilmProjectMaxOrderByAggregateInput
    _min?: FilmProjectMinOrderByAggregateInput
    _sum?: FilmProjectSumOrderByAggregateInput
  }

  export type FilmProjectScalarWhereWithAggregatesInput = {
    AND?: FilmProjectScalarWhereWithAggregatesInput | FilmProjectScalarWhereWithAggregatesInput[]
    OR?: FilmProjectScalarWhereWithAggregatesInput[]
    NOT?: FilmProjectScalarWhereWithAggregatesInput | FilmProjectScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"FilmProject"> | string
    title?: StringWithAggregatesFilter<"FilmProject"> | string
    titleEn?: StringNullableWithAggregatesFilter<"FilmProject"> | string | null
    genre?: StringNullableWithAggregatesFilter<"FilmProject"> | string | null
    logline?: StringNullableWithAggregatesFilter<"FilmProject"> | string | null
    totalBudget?: IntNullableWithAggregatesFilter<"FilmProject"> | number | null
    budgetBreakdown?: StringWithAggregatesFilter<"FilmProject"> | string
    status?: EnumProjectStatusWithAggregatesFilter<"FilmProject"> | $Enums.ProjectStatus
    targetReleaseDate?: StringNullableWithAggregatesFilter<"FilmProject"> | string | null
    scriptId?: StringNullableWithAggregatesFilter<"FilmProject"> | string | null
    notes?: StringNullableWithAggregatesFilter<"FilmProject"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"FilmProject"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"FilmProject"> | Date | string
  }

  export type SPCWhereInput = {
    AND?: SPCWhereInput | SPCWhereInput[]
    OR?: SPCWhereInput[]
    NOT?: SPCWhereInput | SPCWhereInput[]
    id?: StringFilter<"SPC"> | string
    projectId?: StringFilter<"SPC"> | string
    name?: StringFilter<"SPC"> | string
    legalType?: EnumSPCLegalTypeFilter<"SPC"> | $Enums.SPCLegalType
    registrationNumber?: StringNullableFilter<"SPC"> | string | null
    incorporationDate?: StringNullableFilter<"SPC"> | string | null
    totalCapital?: IntNullableFilter<"SPC"> | number | null
    totalBudget?: IntNullableFilter<"SPC"> | number | null
    raisedAmount?: IntFilter<"SPC"> | number
    status?: EnumSPCStatusFilter<"SPC"> | $Enums.SPCStatus
    notes?: StringNullableFilter<"SPC"> | string | null
    createdAt?: DateTimeFilter<"SPC"> | Date | string
    updatedAt?: DateTimeFilter<"SPC"> | Date | string
    project?: XOR<FilmProjectScalarRelationFilter, FilmProjectWhereInput>
    tranches?: PFTrancheListRelationFilter
    waterfallTiers?: WaterfallTierListRelationFilter
    revenueEvents?: RevenueEventListRelationFilter
  }

  export type SPCOrderByWithRelationInput = {
    id?: SortOrder
    projectId?: SortOrder
    name?: SortOrder
    legalType?: SortOrder
    registrationNumber?: SortOrderInput | SortOrder
    incorporationDate?: SortOrderInput | SortOrder
    totalCapital?: SortOrderInput | SortOrder
    totalBudget?: SortOrderInput | SortOrder
    raisedAmount?: SortOrder
    status?: SortOrder
    notes?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    project?: FilmProjectOrderByWithRelationInput
    tranches?: PFTrancheOrderByRelationAggregateInput
    waterfallTiers?: WaterfallTierOrderByRelationAggregateInput
    revenueEvents?: RevenueEventOrderByRelationAggregateInput
  }

  export type SPCWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    name?: string
    AND?: SPCWhereInput | SPCWhereInput[]
    OR?: SPCWhereInput[]
    NOT?: SPCWhereInput | SPCWhereInput[]
    projectId?: StringFilter<"SPC"> | string
    legalType?: EnumSPCLegalTypeFilter<"SPC"> | $Enums.SPCLegalType
    registrationNumber?: StringNullableFilter<"SPC"> | string | null
    incorporationDate?: StringNullableFilter<"SPC"> | string | null
    totalCapital?: IntNullableFilter<"SPC"> | number | null
    totalBudget?: IntNullableFilter<"SPC"> | number | null
    raisedAmount?: IntFilter<"SPC"> | number
    status?: EnumSPCStatusFilter<"SPC"> | $Enums.SPCStatus
    notes?: StringNullableFilter<"SPC"> | string | null
    createdAt?: DateTimeFilter<"SPC"> | Date | string
    updatedAt?: DateTimeFilter<"SPC"> | Date | string
    project?: XOR<FilmProjectScalarRelationFilter, FilmProjectWhereInput>
    tranches?: PFTrancheListRelationFilter
    waterfallTiers?: WaterfallTierListRelationFilter
    revenueEvents?: RevenueEventListRelationFilter
  }, "id" | "name">

  export type SPCOrderByWithAggregationInput = {
    id?: SortOrder
    projectId?: SortOrder
    name?: SortOrder
    legalType?: SortOrder
    registrationNumber?: SortOrderInput | SortOrder
    incorporationDate?: SortOrderInput | SortOrder
    totalCapital?: SortOrderInput | SortOrder
    totalBudget?: SortOrderInput | SortOrder
    raisedAmount?: SortOrder
    status?: SortOrder
    notes?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: SPCCountOrderByAggregateInput
    _avg?: SPCAvgOrderByAggregateInput
    _max?: SPCMaxOrderByAggregateInput
    _min?: SPCMinOrderByAggregateInput
    _sum?: SPCSumOrderByAggregateInput
  }

  export type SPCScalarWhereWithAggregatesInput = {
    AND?: SPCScalarWhereWithAggregatesInput | SPCScalarWhereWithAggregatesInput[]
    OR?: SPCScalarWhereWithAggregatesInput[]
    NOT?: SPCScalarWhereWithAggregatesInput | SPCScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"SPC"> | string
    projectId?: StringWithAggregatesFilter<"SPC"> | string
    name?: StringWithAggregatesFilter<"SPC"> | string
    legalType?: EnumSPCLegalTypeWithAggregatesFilter<"SPC"> | $Enums.SPCLegalType
    registrationNumber?: StringNullableWithAggregatesFilter<"SPC"> | string | null
    incorporationDate?: StringNullableWithAggregatesFilter<"SPC"> | string | null
    totalCapital?: IntNullableWithAggregatesFilter<"SPC"> | number | null
    totalBudget?: IntNullableWithAggregatesFilter<"SPC"> | number | null
    raisedAmount?: IntWithAggregatesFilter<"SPC"> | number
    status?: EnumSPCStatusWithAggregatesFilter<"SPC"> | $Enums.SPCStatus
    notes?: StringNullableWithAggregatesFilter<"SPC"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"SPC"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"SPC"> | Date | string
  }

  export type PFTrancheWhereInput = {
    AND?: PFTrancheWhereInput | PFTrancheWhereInput[]
    OR?: PFTrancheWhereInput[]
    NOT?: PFTrancheWhereInput | PFTrancheWhereInput[]
    id?: StringFilter<"PFTranche"> | string
    spcId?: StringFilter<"PFTranche"> | string
    name?: StringFilter<"PFTranche"> | string
    type?: EnumTrancheTypeFilter<"PFTranche"> | $Enums.TrancheType
    priority?: IntFilter<"PFTranche"> | number
    targetAmount?: IntFilter<"PFTranche"> | number
    raisedAmount?: IntFilter<"PFTranche"> | number
    interestRate?: FloatNullableFilter<"PFTranche"> | number | null
    targetReturn?: FloatNullableFilter<"PFTranche"> | number | null
    termMonths?: IntNullableFilter<"PFTranche"> | number | null
    status?: EnumTrancheStatusFilter<"PFTranche"> | $Enums.TrancheStatus
    notes?: StringNullableFilter<"PFTranche"> | string | null
    createdAt?: DateTimeFilter<"PFTranche"> | Date | string
    updatedAt?: DateTimeFilter<"PFTranche"> | Date | string
    spc?: XOR<SPCScalarRelationFilter, SPCWhereInput>
    investors?: PFTrancheInvestorListRelationFilter
    waterfallTiers?: WaterfallTierListRelationFilter
  }

  export type PFTrancheOrderByWithRelationInput = {
    id?: SortOrder
    spcId?: SortOrder
    name?: SortOrder
    type?: SortOrder
    priority?: SortOrder
    targetAmount?: SortOrder
    raisedAmount?: SortOrder
    interestRate?: SortOrderInput | SortOrder
    targetReturn?: SortOrderInput | SortOrder
    termMonths?: SortOrderInput | SortOrder
    status?: SortOrder
    notes?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    spc?: SPCOrderByWithRelationInput
    investors?: PFTrancheInvestorOrderByRelationAggregateInput
    waterfallTiers?: WaterfallTierOrderByRelationAggregateInput
  }

  export type PFTrancheWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: PFTrancheWhereInput | PFTrancheWhereInput[]
    OR?: PFTrancheWhereInput[]
    NOT?: PFTrancheWhereInput | PFTrancheWhereInput[]
    spcId?: StringFilter<"PFTranche"> | string
    name?: StringFilter<"PFTranche"> | string
    type?: EnumTrancheTypeFilter<"PFTranche"> | $Enums.TrancheType
    priority?: IntFilter<"PFTranche"> | number
    targetAmount?: IntFilter<"PFTranche"> | number
    raisedAmount?: IntFilter<"PFTranche"> | number
    interestRate?: FloatNullableFilter<"PFTranche"> | number | null
    targetReturn?: FloatNullableFilter<"PFTranche"> | number | null
    termMonths?: IntNullableFilter<"PFTranche"> | number | null
    status?: EnumTrancheStatusFilter<"PFTranche"> | $Enums.TrancheStatus
    notes?: StringNullableFilter<"PFTranche"> | string | null
    createdAt?: DateTimeFilter<"PFTranche"> | Date | string
    updatedAt?: DateTimeFilter<"PFTranche"> | Date | string
    spc?: XOR<SPCScalarRelationFilter, SPCWhereInput>
    investors?: PFTrancheInvestorListRelationFilter
    waterfallTiers?: WaterfallTierListRelationFilter
  }, "id">

  export type PFTrancheOrderByWithAggregationInput = {
    id?: SortOrder
    spcId?: SortOrder
    name?: SortOrder
    type?: SortOrder
    priority?: SortOrder
    targetAmount?: SortOrder
    raisedAmount?: SortOrder
    interestRate?: SortOrderInput | SortOrder
    targetReturn?: SortOrderInput | SortOrder
    termMonths?: SortOrderInput | SortOrder
    status?: SortOrder
    notes?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: PFTrancheCountOrderByAggregateInput
    _avg?: PFTrancheAvgOrderByAggregateInput
    _max?: PFTrancheMaxOrderByAggregateInput
    _min?: PFTrancheMinOrderByAggregateInput
    _sum?: PFTrancheSumOrderByAggregateInput
  }

  export type PFTrancheScalarWhereWithAggregatesInput = {
    AND?: PFTrancheScalarWhereWithAggregatesInput | PFTrancheScalarWhereWithAggregatesInput[]
    OR?: PFTrancheScalarWhereWithAggregatesInput[]
    NOT?: PFTrancheScalarWhereWithAggregatesInput | PFTrancheScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"PFTranche"> | string
    spcId?: StringWithAggregatesFilter<"PFTranche"> | string
    name?: StringWithAggregatesFilter<"PFTranche"> | string
    type?: EnumTrancheTypeWithAggregatesFilter<"PFTranche"> | $Enums.TrancheType
    priority?: IntWithAggregatesFilter<"PFTranche"> | number
    targetAmount?: IntWithAggregatesFilter<"PFTranche"> | number
    raisedAmount?: IntWithAggregatesFilter<"PFTranche"> | number
    interestRate?: FloatNullableWithAggregatesFilter<"PFTranche"> | number | null
    targetReturn?: FloatNullableWithAggregatesFilter<"PFTranche"> | number | null
    termMonths?: IntNullableWithAggregatesFilter<"PFTranche"> | number | null
    status?: EnumTrancheStatusWithAggregatesFilter<"PFTranche"> | $Enums.TrancheStatus
    notes?: StringNullableWithAggregatesFilter<"PFTranche"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"PFTranche"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"PFTranche"> | Date | string
  }

  export type PFTrancheInvestorWhereInput = {
    AND?: PFTrancheInvestorWhereInput | PFTrancheInvestorWhereInput[]
    OR?: PFTrancheInvestorWhereInput[]
    NOT?: PFTrancheInvestorWhereInput | PFTrancheInvestorWhereInput[]
    id?: StringFilter<"PFTrancheInvestor"> | string
    trancheId?: StringFilter<"PFTrancheInvestor"> | string
    investorId?: StringFilter<"PFTrancheInvestor"> | string
    amount?: IntFilter<"PFTrancheInvestor"> | number
    percentage?: FloatNullableFilter<"PFTrancheInvestor"> | number | null
    joinedAt?: DateTimeFilter<"PFTrancheInvestor"> | Date | string
    notes?: StringNullableFilter<"PFTrancheInvestor"> | string | null
    tranche?: XOR<PFTrancheScalarRelationFilter, PFTrancheWhereInput>
    investor?: XOR<InvestorScalarRelationFilter, InvestorWhereInput>
  }

  export type PFTrancheInvestorOrderByWithRelationInput = {
    id?: SortOrder
    trancheId?: SortOrder
    investorId?: SortOrder
    amount?: SortOrder
    percentage?: SortOrderInput | SortOrder
    joinedAt?: SortOrder
    notes?: SortOrderInput | SortOrder
    tranche?: PFTrancheOrderByWithRelationInput
    investor?: InvestorOrderByWithRelationInput
  }

  export type PFTrancheInvestorWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    trancheId_investorId?: PFTrancheInvestorTrancheIdInvestorIdCompoundUniqueInput
    AND?: PFTrancheInvestorWhereInput | PFTrancheInvestorWhereInput[]
    OR?: PFTrancheInvestorWhereInput[]
    NOT?: PFTrancheInvestorWhereInput | PFTrancheInvestorWhereInput[]
    trancheId?: StringFilter<"PFTrancheInvestor"> | string
    investorId?: StringFilter<"PFTrancheInvestor"> | string
    amount?: IntFilter<"PFTrancheInvestor"> | number
    percentage?: FloatNullableFilter<"PFTrancheInvestor"> | number | null
    joinedAt?: DateTimeFilter<"PFTrancheInvestor"> | Date | string
    notes?: StringNullableFilter<"PFTrancheInvestor"> | string | null
    tranche?: XOR<PFTrancheScalarRelationFilter, PFTrancheWhereInput>
    investor?: XOR<InvestorScalarRelationFilter, InvestorWhereInput>
  }, "id" | "trancheId_investorId">

  export type PFTrancheInvestorOrderByWithAggregationInput = {
    id?: SortOrder
    trancheId?: SortOrder
    investorId?: SortOrder
    amount?: SortOrder
    percentage?: SortOrderInput | SortOrder
    joinedAt?: SortOrder
    notes?: SortOrderInput | SortOrder
    _count?: PFTrancheInvestorCountOrderByAggregateInput
    _avg?: PFTrancheInvestorAvgOrderByAggregateInput
    _max?: PFTrancheInvestorMaxOrderByAggregateInput
    _min?: PFTrancheInvestorMinOrderByAggregateInput
    _sum?: PFTrancheInvestorSumOrderByAggregateInput
  }

  export type PFTrancheInvestorScalarWhereWithAggregatesInput = {
    AND?: PFTrancheInvestorScalarWhereWithAggregatesInput | PFTrancheInvestorScalarWhereWithAggregatesInput[]
    OR?: PFTrancheInvestorScalarWhereWithAggregatesInput[]
    NOT?: PFTrancheInvestorScalarWhereWithAggregatesInput | PFTrancheInvestorScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"PFTrancheInvestor"> | string
    trancheId?: StringWithAggregatesFilter<"PFTrancheInvestor"> | string
    investorId?: StringWithAggregatesFilter<"PFTrancheInvestor"> | string
    amount?: IntWithAggregatesFilter<"PFTrancheInvestor"> | number
    percentage?: FloatNullableWithAggregatesFilter<"PFTrancheInvestor"> | number | null
    joinedAt?: DateTimeWithAggregatesFilter<"PFTrancheInvestor"> | Date | string
    notes?: StringNullableWithAggregatesFilter<"PFTrancheInvestor"> | string | null
  }

  export type WaterfallTierWhereInput = {
    AND?: WaterfallTierWhereInput | WaterfallTierWhereInput[]
    OR?: WaterfallTierWhereInput[]
    NOT?: WaterfallTierWhereInput | WaterfallTierWhereInput[]
    id?: StringFilter<"WaterfallTier"> | string
    spcId?: StringFilter<"WaterfallTier"> | string
    priority?: IntFilter<"WaterfallTier"> | number
    name?: StringFilter<"WaterfallTier"> | string
    type?: EnumTierTypeFilter<"WaterfallTier"> | $Enums.TierType
    trancheId?: StringNullableFilter<"WaterfallTier"> | string | null
    amountCap?: IntNullableFilter<"WaterfallTier"> | number | null
    percentage?: FloatNullableFilter<"WaterfallTier"> | number | null
    multiplier?: FloatNullableFilter<"WaterfallTier"> | number | null
    description?: StringNullableFilter<"WaterfallTier"> | string | null
    spc?: XOR<SPCScalarRelationFilter, SPCWhereInput>
    tranche?: XOR<PFTrancheNullableScalarRelationFilter, PFTrancheWhereInput> | null
  }

  export type WaterfallTierOrderByWithRelationInput = {
    id?: SortOrder
    spcId?: SortOrder
    priority?: SortOrder
    name?: SortOrder
    type?: SortOrder
    trancheId?: SortOrderInput | SortOrder
    amountCap?: SortOrderInput | SortOrder
    percentage?: SortOrderInput | SortOrder
    multiplier?: SortOrderInput | SortOrder
    description?: SortOrderInput | SortOrder
    spc?: SPCOrderByWithRelationInput
    tranche?: PFTrancheOrderByWithRelationInput
  }

  export type WaterfallTierWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: WaterfallTierWhereInput | WaterfallTierWhereInput[]
    OR?: WaterfallTierWhereInput[]
    NOT?: WaterfallTierWhereInput | WaterfallTierWhereInput[]
    spcId?: StringFilter<"WaterfallTier"> | string
    priority?: IntFilter<"WaterfallTier"> | number
    name?: StringFilter<"WaterfallTier"> | string
    type?: EnumTierTypeFilter<"WaterfallTier"> | $Enums.TierType
    trancheId?: StringNullableFilter<"WaterfallTier"> | string | null
    amountCap?: IntNullableFilter<"WaterfallTier"> | number | null
    percentage?: FloatNullableFilter<"WaterfallTier"> | number | null
    multiplier?: FloatNullableFilter<"WaterfallTier"> | number | null
    description?: StringNullableFilter<"WaterfallTier"> | string | null
    spc?: XOR<SPCScalarRelationFilter, SPCWhereInput>
    tranche?: XOR<PFTrancheNullableScalarRelationFilter, PFTrancheWhereInput> | null
  }, "id">

  export type WaterfallTierOrderByWithAggregationInput = {
    id?: SortOrder
    spcId?: SortOrder
    priority?: SortOrder
    name?: SortOrder
    type?: SortOrder
    trancheId?: SortOrderInput | SortOrder
    amountCap?: SortOrderInput | SortOrder
    percentage?: SortOrderInput | SortOrder
    multiplier?: SortOrderInput | SortOrder
    description?: SortOrderInput | SortOrder
    _count?: WaterfallTierCountOrderByAggregateInput
    _avg?: WaterfallTierAvgOrderByAggregateInput
    _max?: WaterfallTierMaxOrderByAggregateInput
    _min?: WaterfallTierMinOrderByAggregateInput
    _sum?: WaterfallTierSumOrderByAggregateInput
  }

  export type WaterfallTierScalarWhereWithAggregatesInput = {
    AND?: WaterfallTierScalarWhereWithAggregatesInput | WaterfallTierScalarWhereWithAggregatesInput[]
    OR?: WaterfallTierScalarWhereWithAggregatesInput[]
    NOT?: WaterfallTierScalarWhereWithAggregatesInput | WaterfallTierScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"WaterfallTier"> | string
    spcId?: StringWithAggregatesFilter<"WaterfallTier"> | string
    priority?: IntWithAggregatesFilter<"WaterfallTier"> | number
    name?: StringWithAggregatesFilter<"WaterfallTier"> | string
    type?: EnumTierTypeWithAggregatesFilter<"WaterfallTier"> | $Enums.TierType
    trancheId?: StringNullableWithAggregatesFilter<"WaterfallTier"> | string | null
    amountCap?: IntNullableWithAggregatesFilter<"WaterfallTier"> | number | null
    percentage?: FloatNullableWithAggregatesFilter<"WaterfallTier"> | number | null
    multiplier?: FloatNullableWithAggregatesFilter<"WaterfallTier"> | number | null
    description?: StringNullableWithAggregatesFilter<"WaterfallTier"> | string | null
  }

  export type RevenueEventWhereInput = {
    AND?: RevenueEventWhereInput | RevenueEventWhereInput[]
    OR?: RevenueEventWhereInput[]
    NOT?: RevenueEventWhereInput | RevenueEventWhereInput[]
    id?: StringFilter<"RevenueEvent"> | string
    spcId?: StringFilter<"RevenueEvent"> | string
    amount?: IntFilter<"RevenueEvent"> | number
    source?: EnumRevenueSourceFilter<"RevenueEvent"> | $Enums.RevenueSource
    eventDate?: StringFilter<"RevenueEvent"> | string
    notes?: StringNullableFilter<"RevenueEvent"> | string | null
    distributionStatus?: StringFilter<"RevenueEvent"> | string
    createdAt?: DateTimeFilter<"RevenueEvent"> | Date | string
    spc?: XOR<SPCScalarRelationFilter, SPCWhereInput>
    distributions?: WaterfallDistributionListRelationFilter
  }

  export type RevenueEventOrderByWithRelationInput = {
    id?: SortOrder
    spcId?: SortOrder
    amount?: SortOrder
    source?: SortOrder
    eventDate?: SortOrder
    notes?: SortOrderInput | SortOrder
    distributionStatus?: SortOrder
    createdAt?: SortOrder
    spc?: SPCOrderByWithRelationInput
    distributions?: WaterfallDistributionOrderByRelationAggregateInput
  }

  export type RevenueEventWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: RevenueEventWhereInput | RevenueEventWhereInput[]
    OR?: RevenueEventWhereInput[]
    NOT?: RevenueEventWhereInput | RevenueEventWhereInput[]
    spcId?: StringFilter<"RevenueEvent"> | string
    amount?: IntFilter<"RevenueEvent"> | number
    source?: EnumRevenueSourceFilter<"RevenueEvent"> | $Enums.RevenueSource
    eventDate?: StringFilter<"RevenueEvent"> | string
    notes?: StringNullableFilter<"RevenueEvent"> | string | null
    distributionStatus?: StringFilter<"RevenueEvent"> | string
    createdAt?: DateTimeFilter<"RevenueEvent"> | Date | string
    spc?: XOR<SPCScalarRelationFilter, SPCWhereInput>
    distributions?: WaterfallDistributionListRelationFilter
  }, "id">

  export type RevenueEventOrderByWithAggregationInput = {
    id?: SortOrder
    spcId?: SortOrder
    amount?: SortOrder
    source?: SortOrder
    eventDate?: SortOrder
    notes?: SortOrderInput | SortOrder
    distributionStatus?: SortOrder
    createdAt?: SortOrder
    _count?: RevenueEventCountOrderByAggregateInput
    _avg?: RevenueEventAvgOrderByAggregateInput
    _max?: RevenueEventMaxOrderByAggregateInput
    _min?: RevenueEventMinOrderByAggregateInput
    _sum?: RevenueEventSumOrderByAggregateInput
  }

  export type RevenueEventScalarWhereWithAggregatesInput = {
    AND?: RevenueEventScalarWhereWithAggregatesInput | RevenueEventScalarWhereWithAggregatesInput[]
    OR?: RevenueEventScalarWhereWithAggregatesInput[]
    NOT?: RevenueEventScalarWhereWithAggregatesInput | RevenueEventScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"RevenueEvent"> | string
    spcId?: StringWithAggregatesFilter<"RevenueEvent"> | string
    amount?: IntWithAggregatesFilter<"RevenueEvent"> | number
    source?: EnumRevenueSourceWithAggregatesFilter<"RevenueEvent"> | $Enums.RevenueSource
    eventDate?: StringWithAggregatesFilter<"RevenueEvent"> | string
    notes?: StringNullableWithAggregatesFilter<"RevenueEvent"> | string | null
    distributionStatus?: StringWithAggregatesFilter<"RevenueEvent"> | string
    createdAt?: DateTimeWithAggregatesFilter<"RevenueEvent"> | Date | string
  }

  export type WaterfallDistributionWhereInput = {
    AND?: WaterfallDistributionWhereInput | WaterfallDistributionWhereInput[]
    OR?: WaterfallDistributionWhereInput[]
    NOT?: WaterfallDistributionWhereInput | WaterfallDistributionWhereInput[]
    id?: StringFilter<"WaterfallDistribution"> | string
    eventId?: StringFilter<"WaterfallDistribution"> | string
    tierId?: StringFilter<"WaterfallDistribution"> | string
    tierName?: StringFilter<"WaterfallDistribution"> | string
    tierPriority?: IntFilter<"WaterfallDistribution"> | number
    allocatedAmount?: IntFilter<"WaterfallDistribution"> | number
    cumulativePaid?: IntFilter<"WaterfallDistribution"> | number
    isFullySatisfied?: BoolFilter<"WaterfallDistribution"> | boolean
    calculatedAt?: DateTimeFilter<"WaterfallDistribution"> | Date | string
    event?: XOR<RevenueEventScalarRelationFilter, RevenueEventWhereInput>
  }

  export type WaterfallDistributionOrderByWithRelationInput = {
    id?: SortOrder
    eventId?: SortOrder
    tierId?: SortOrder
    tierName?: SortOrder
    tierPriority?: SortOrder
    allocatedAmount?: SortOrder
    cumulativePaid?: SortOrder
    isFullySatisfied?: SortOrder
    calculatedAt?: SortOrder
    event?: RevenueEventOrderByWithRelationInput
  }

  export type WaterfallDistributionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: WaterfallDistributionWhereInput | WaterfallDistributionWhereInput[]
    OR?: WaterfallDistributionWhereInput[]
    NOT?: WaterfallDistributionWhereInput | WaterfallDistributionWhereInput[]
    eventId?: StringFilter<"WaterfallDistribution"> | string
    tierId?: StringFilter<"WaterfallDistribution"> | string
    tierName?: StringFilter<"WaterfallDistribution"> | string
    tierPriority?: IntFilter<"WaterfallDistribution"> | number
    allocatedAmount?: IntFilter<"WaterfallDistribution"> | number
    cumulativePaid?: IntFilter<"WaterfallDistribution"> | number
    isFullySatisfied?: BoolFilter<"WaterfallDistribution"> | boolean
    calculatedAt?: DateTimeFilter<"WaterfallDistribution"> | Date | string
    event?: XOR<RevenueEventScalarRelationFilter, RevenueEventWhereInput>
  }, "id">

  export type WaterfallDistributionOrderByWithAggregationInput = {
    id?: SortOrder
    eventId?: SortOrder
    tierId?: SortOrder
    tierName?: SortOrder
    tierPriority?: SortOrder
    allocatedAmount?: SortOrder
    cumulativePaid?: SortOrder
    isFullySatisfied?: SortOrder
    calculatedAt?: SortOrder
    _count?: WaterfallDistributionCountOrderByAggregateInput
    _avg?: WaterfallDistributionAvgOrderByAggregateInput
    _max?: WaterfallDistributionMaxOrderByAggregateInput
    _min?: WaterfallDistributionMinOrderByAggregateInput
    _sum?: WaterfallDistributionSumOrderByAggregateInput
  }

  export type WaterfallDistributionScalarWhereWithAggregatesInput = {
    AND?: WaterfallDistributionScalarWhereWithAggregatesInput | WaterfallDistributionScalarWhereWithAggregatesInput[]
    OR?: WaterfallDistributionScalarWhereWithAggregatesInput[]
    NOT?: WaterfallDistributionScalarWhereWithAggregatesInput | WaterfallDistributionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"WaterfallDistribution"> | string
    eventId?: StringWithAggregatesFilter<"WaterfallDistribution"> | string
    tierId?: StringWithAggregatesFilter<"WaterfallDistribution"> | string
    tierName?: StringWithAggregatesFilter<"WaterfallDistribution"> | string
    tierPriority?: IntWithAggregatesFilter<"WaterfallDistribution"> | number
    allocatedAmount?: IntWithAggregatesFilter<"WaterfallDistribution"> | number
    cumulativePaid?: IntWithAggregatesFilter<"WaterfallDistribution"> | number
    isFullySatisfied?: BoolWithAggregatesFilter<"WaterfallDistribution"> | boolean
    calculatedAt?: DateTimeWithAggregatesFilter<"WaterfallDistribution"> | Date | string
  }

  export type InvestorCreateInput = {
    id?: string
    name: string
    nameEn?: string | null
    type: $Enums.InvestorType
    tier?: $Enums.InvestorTier
    status?: $Enums.InvestorStatus
    country?: string
    region?: string | null
    contactName?: string | null
    contactEmail?: string | null
    contactPhone?: string | null
    investmentCapacity?: number | null
    minTicket?: number | null
    maxTicket?: number | null
    preferredGenres?: string
    preferredBudgetRange?: string
    pastInvestments?: string
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    groupMemberships?: InvestorGroupMemberCreateNestedManyWithoutInvestorInput
    tranchePositions?: PFTrancheInvestorCreateNestedManyWithoutInvestorInput
  }

  export type InvestorUncheckedCreateInput = {
    id?: string
    name: string
    nameEn?: string | null
    type: $Enums.InvestorType
    tier?: $Enums.InvestorTier
    status?: $Enums.InvestorStatus
    country?: string
    region?: string | null
    contactName?: string | null
    contactEmail?: string | null
    contactPhone?: string | null
    investmentCapacity?: number | null
    minTicket?: number | null
    maxTicket?: number | null
    preferredGenres?: string
    preferredBudgetRange?: string
    pastInvestments?: string
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    groupMemberships?: InvestorGroupMemberUncheckedCreateNestedManyWithoutInvestorInput
    tranchePositions?: PFTrancheInvestorUncheckedCreateNestedManyWithoutInvestorInput
  }

  export type InvestorUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    nameEn?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumInvestorTypeFieldUpdateOperationsInput | $Enums.InvestorType
    tier?: EnumInvestorTierFieldUpdateOperationsInput | $Enums.InvestorTier
    status?: EnumInvestorStatusFieldUpdateOperationsInput | $Enums.InvestorStatus
    country?: StringFieldUpdateOperationsInput | string
    region?: NullableStringFieldUpdateOperationsInput | string | null
    contactName?: NullableStringFieldUpdateOperationsInput | string | null
    contactEmail?: NullableStringFieldUpdateOperationsInput | string | null
    contactPhone?: NullableStringFieldUpdateOperationsInput | string | null
    investmentCapacity?: NullableIntFieldUpdateOperationsInput | number | null
    minTicket?: NullableIntFieldUpdateOperationsInput | number | null
    maxTicket?: NullableIntFieldUpdateOperationsInput | number | null
    preferredGenres?: StringFieldUpdateOperationsInput | string
    preferredBudgetRange?: StringFieldUpdateOperationsInput | string
    pastInvestments?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    groupMemberships?: InvestorGroupMemberUpdateManyWithoutInvestorNestedInput
    tranchePositions?: PFTrancheInvestorUpdateManyWithoutInvestorNestedInput
  }

  export type InvestorUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    nameEn?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumInvestorTypeFieldUpdateOperationsInput | $Enums.InvestorType
    tier?: EnumInvestorTierFieldUpdateOperationsInput | $Enums.InvestorTier
    status?: EnumInvestorStatusFieldUpdateOperationsInput | $Enums.InvestorStatus
    country?: StringFieldUpdateOperationsInput | string
    region?: NullableStringFieldUpdateOperationsInput | string | null
    contactName?: NullableStringFieldUpdateOperationsInput | string | null
    contactEmail?: NullableStringFieldUpdateOperationsInput | string | null
    contactPhone?: NullableStringFieldUpdateOperationsInput | string | null
    investmentCapacity?: NullableIntFieldUpdateOperationsInput | number | null
    minTicket?: NullableIntFieldUpdateOperationsInput | number | null
    maxTicket?: NullableIntFieldUpdateOperationsInput | number | null
    preferredGenres?: StringFieldUpdateOperationsInput | string
    preferredBudgetRange?: StringFieldUpdateOperationsInput | string
    pastInvestments?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    groupMemberships?: InvestorGroupMemberUncheckedUpdateManyWithoutInvestorNestedInput
    tranchePositions?: PFTrancheInvestorUncheckedUpdateManyWithoutInvestorNestedInput
  }

  export type InvestorCreateManyInput = {
    id?: string
    name: string
    nameEn?: string | null
    type: $Enums.InvestorType
    tier?: $Enums.InvestorTier
    status?: $Enums.InvestorStatus
    country?: string
    region?: string | null
    contactName?: string | null
    contactEmail?: string | null
    contactPhone?: string | null
    investmentCapacity?: number | null
    minTicket?: number | null
    maxTicket?: number | null
    preferredGenres?: string
    preferredBudgetRange?: string
    pastInvestments?: string
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type InvestorUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    nameEn?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumInvestorTypeFieldUpdateOperationsInput | $Enums.InvestorType
    tier?: EnumInvestorTierFieldUpdateOperationsInput | $Enums.InvestorTier
    status?: EnumInvestorStatusFieldUpdateOperationsInput | $Enums.InvestorStatus
    country?: StringFieldUpdateOperationsInput | string
    region?: NullableStringFieldUpdateOperationsInput | string | null
    contactName?: NullableStringFieldUpdateOperationsInput | string | null
    contactEmail?: NullableStringFieldUpdateOperationsInput | string | null
    contactPhone?: NullableStringFieldUpdateOperationsInput | string | null
    investmentCapacity?: NullableIntFieldUpdateOperationsInput | number | null
    minTicket?: NullableIntFieldUpdateOperationsInput | number | null
    maxTicket?: NullableIntFieldUpdateOperationsInput | number | null
    preferredGenres?: StringFieldUpdateOperationsInput | string
    preferredBudgetRange?: StringFieldUpdateOperationsInput | string
    pastInvestments?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InvestorUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    nameEn?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumInvestorTypeFieldUpdateOperationsInput | $Enums.InvestorType
    tier?: EnumInvestorTierFieldUpdateOperationsInput | $Enums.InvestorTier
    status?: EnumInvestorStatusFieldUpdateOperationsInput | $Enums.InvestorStatus
    country?: StringFieldUpdateOperationsInput | string
    region?: NullableStringFieldUpdateOperationsInput | string | null
    contactName?: NullableStringFieldUpdateOperationsInput | string | null
    contactEmail?: NullableStringFieldUpdateOperationsInput | string | null
    contactPhone?: NullableStringFieldUpdateOperationsInput | string | null
    investmentCapacity?: NullableIntFieldUpdateOperationsInput | number | null
    minTicket?: NullableIntFieldUpdateOperationsInput | number | null
    maxTicket?: NullableIntFieldUpdateOperationsInput | number | null
    preferredGenres?: StringFieldUpdateOperationsInput | string
    preferredBudgetRange?: StringFieldUpdateOperationsInput | string
    pastInvestments?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InvestorGroupCreateInput = {
    id?: string
    name: string
    type: $Enums.InvestorGroupType
    managingFirm?: string | null
    totalCommitment?: number | null
    status?: $Enums.InvestorGroupStatus
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    members?: InvestorGroupMemberCreateNestedManyWithoutGroupInput
  }

  export type InvestorGroupUncheckedCreateInput = {
    id?: string
    name: string
    type: $Enums.InvestorGroupType
    managingFirm?: string | null
    totalCommitment?: number | null
    status?: $Enums.InvestorGroupStatus
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    members?: InvestorGroupMemberUncheckedCreateNestedManyWithoutGroupInput
  }

  export type InvestorGroupUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: EnumInvestorGroupTypeFieldUpdateOperationsInput | $Enums.InvestorGroupType
    managingFirm?: NullableStringFieldUpdateOperationsInput | string | null
    totalCommitment?: NullableIntFieldUpdateOperationsInput | number | null
    status?: EnumInvestorGroupStatusFieldUpdateOperationsInput | $Enums.InvestorGroupStatus
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    members?: InvestorGroupMemberUpdateManyWithoutGroupNestedInput
  }

  export type InvestorGroupUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: EnumInvestorGroupTypeFieldUpdateOperationsInput | $Enums.InvestorGroupType
    managingFirm?: NullableStringFieldUpdateOperationsInput | string | null
    totalCommitment?: NullableIntFieldUpdateOperationsInput | number | null
    status?: EnumInvestorGroupStatusFieldUpdateOperationsInput | $Enums.InvestorGroupStatus
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    members?: InvestorGroupMemberUncheckedUpdateManyWithoutGroupNestedInput
  }

  export type InvestorGroupCreateManyInput = {
    id?: string
    name: string
    type: $Enums.InvestorGroupType
    managingFirm?: string | null
    totalCommitment?: number | null
    status?: $Enums.InvestorGroupStatus
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type InvestorGroupUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: EnumInvestorGroupTypeFieldUpdateOperationsInput | $Enums.InvestorGroupType
    managingFirm?: NullableStringFieldUpdateOperationsInput | string | null
    totalCommitment?: NullableIntFieldUpdateOperationsInput | number | null
    status?: EnumInvestorGroupStatusFieldUpdateOperationsInput | $Enums.InvestorGroupStatus
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InvestorGroupUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: EnumInvestorGroupTypeFieldUpdateOperationsInput | $Enums.InvestorGroupType
    managingFirm?: NullableStringFieldUpdateOperationsInput | string | null
    totalCommitment?: NullableIntFieldUpdateOperationsInput | number | null
    status?: EnumInvestorGroupStatusFieldUpdateOperationsInput | $Enums.InvestorGroupStatus
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InvestorGroupMemberCreateInput = {
    id?: string
    commitment?: number | null
    role?: string
    joinedAt?: Date | string
    group: InvestorGroupCreateNestedOneWithoutMembersInput
    investor: InvestorCreateNestedOneWithoutGroupMembershipsInput
  }

  export type InvestorGroupMemberUncheckedCreateInput = {
    id?: string
    groupId: string
    investorId: string
    commitment?: number | null
    role?: string
    joinedAt?: Date | string
  }

  export type InvestorGroupMemberUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    commitment?: NullableIntFieldUpdateOperationsInput | number | null
    role?: StringFieldUpdateOperationsInput | string
    joinedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    group?: InvestorGroupUpdateOneRequiredWithoutMembersNestedInput
    investor?: InvestorUpdateOneRequiredWithoutGroupMembershipsNestedInput
  }

  export type InvestorGroupMemberUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    groupId?: StringFieldUpdateOperationsInput | string
    investorId?: StringFieldUpdateOperationsInput | string
    commitment?: NullableIntFieldUpdateOperationsInput | number | null
    role?: StringFieldUpdateOperationsInput | string
    joinedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InvestorGroupMemberCreateManyInput = {
    id?: string
    groupId: string
    investorId: string
    commitment?: number | null
    role?: string
    joinedAt?: Date | string
  }

  export type InvestorGroupMemberUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    commitment?: NullableIntFieldUpdateOperationsInput | number | null
    role?: StringFieldUpdateOperationsInput | string
    joinedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InvestorGroupMemberUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    groupId?: StringFieldUpdateOperationsInput | string
    investorId?: StringFieldUpdateOperationsInput | string
    commitment?: NullableIntFieldUpdateOperationsInput | number | null
    role?: StringFieldUpdateOperationsInput | string
    joinedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FilmProjectCreateInput = {
    id?: string
    title: string
    titleEn?: string | null
    genre?: string | null
    logline?: string | null
    totalBudget?: number | null
    budgetBreakdown?: string
    status?: $Enums.ProjectStatus
    targetReleaseDate?: string | null
    scriptId?: string | null
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    spcs?: SPCCreateNestedManyWithoutProjectInput
  }

  export type FilmProjectUncheckedCreateInput = {
    id?: string
    title: string
    titleEn?: string | null
    genre?: string | null
    logline?: string | null
    totalBudget?: number | null
    budgetBreakdown?: string
    status?: $Enums.ProjectStatus
    targetReleaseDate?: string | null
    scriptId?: string | null
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    spcs?: SPCUncheckedCreateNestedManyWithoutProjectInput
  }

  export type FilmProjectUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    titleEn?: NullableStringFieldUpdateOperationsInput | string | null
    genre?: NullableStringFieldUpdateOperationsInput | string | null
    logline?: NullableStringFieldUpdateOperationsInput | string | null
    totalBudget?: NullableIntFieldUpdateOperationsInput | number | null
    budgetBreakdown?: StringFieldUpdateOperationsInput | string
    status?: EnumProjectStatusFieldUpdateOperationsInput | $Enums.ProjectStatus
    targetReleaseDate?: NullableStringFieldUpdateOperationsInput | string | null
    scriptId?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    spcs?: SPCUpdateManyWithoutProjectNestedInput
  }

  export type FilmProjectUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    titleEn?: NullableStringFieldUpdateOperationsInput | string | null
    genre?: NullableStringFieldUpdateOperationsInput | string | null
    logline?: NullableStringFieldUpdateOperationsInput | string | null
    totalBudget?: NullableIntFieldUpdateOperationsInput | number | null
    budgetBreakdown?: StringFieldUpdateOperationsInput | string
    status?: EnumProjectStatusFieldUpdateOperationsInput | $Enums.ProjectStatus
    targetReleaseDate?: NullableStringFieldUpdateOperationsInput | string | null
    scriptId?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    spcs?: SPCUncheckedUpdateManyWithoutProjectNestedInput
  }

  export type FilmProjectCreateManyInput = {
    id?: string
    title: string
    titleEn?: string | null
    genre?: string | null
    logline?: string | null
    totalBudget?: number | null
    budgetBreakdown?: string
    status?: $Enums.ProjectStatus
    targetReleaseDate?: string | null
    scriptId?: string | null
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type FilmProjectUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    titleEn?: NullableStringFieldUpdateOperationsInput | string | null
    genre?: NullableStringFieldUpdateOperationsInput | string | null
    logline?: NullableStringFieldUpdateOperationsInput | string | null
    totalBudget?: NullableIntFieldUpdateOperationsInput | number | null
    budgetBreakdown?: StringFieldUpdateOperationsInput | string
    status?: EnumProjectStatusFieldUpdateOperationsInput | $Enums.ProjectStatus
    targetReleaseDate?: NullableStringFieldUpdateOperationsInput | string | null
    scriptId?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FilmProjectUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    titleEn?: NullableStringFieldUpdateOperationsInput | string | null
    genre?: NullableStringFieldUpdateOperationsInput | string | null
    logline?: NullableStringFieldUpdateOperationsInput | string | null
    totalBudget?: NullableIntFieldUpdateOperationsInput | number | null
    budgetBreakdown?: StringFieldUpdateOperationsInput | string
    status?: EnumProjectStatusFieldUpdateOperationsInput | $Enums.ProjectStatus
    targetReleaseDate?: NullableStringFieldUpdateOperationsInput | string | null
    scriptId?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SPCCreateInput = {
    id?: string
    name: string
    legalType?: $Enums.SPCLegalType
    registrationNumber?: string | null
    incorporationDate?: string | null
    totalCapital?: number | null
    totalBudget?: number | null
    raisedAmount?: number
    status?: $Enums.SPCStatus
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    project: FilmProjectCreateNestedOneWithoutSpcsInput
    tranches?: PFTrancheCreateNestedManyWithoutSpcInput
    waterfallTiers?: WaterfallTierCreateNestedManyWithoutSpcInput
    revenueEvents?: RevenueEventCreateNestedManyWithoutSpcInput
  }

  export type SPCUncheckedCreateInput = {
    id?: string
    projectId: string
    name: string
    legalType?: $Enums.SPCLegalType
    registrationNumber?: string | null
    incorporationDate?: string | null
    totalCapital?: number | null
    totalBudget?: number | null
    raisedAmount?: number
    status?: $Enums.SPCStatus
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    tranches?: PFTrancheUncheckedCreateNestedManyWithoutSpcInput
    waterfallTiers?: WaterfallTierUncheckedCreateNestedManyWithoutSpcInput
    revenueEvents?: RevenueEventUncheckedCreateNestedManyWithoutSpcInput
  }

  export type SPCUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    legalType?: EnumSPCLegalTypeFieldUpdateOperationsInput | $Enums.SPCLegalType
    registrationNumber?: NullableStringFieldUpdateOperationsInput | string | null
    incorporationDate?: NullableStringFieldUpdateOperationsInput | string | null
    totalCapital?: NullableIntFieldUpdateOperationsInput | number | null
    totalBudget?: NullableIntFieldUpdateOperationsInput | number | null
    raisedAmount?: IntFieldUpdateOperationsInput | number
    status?: EnumSPCStatusFieldUpdateOperationsInput | $Enums.SPCStatus
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    project?: FilmProjectUpdateOneRequiredWithoutSpcsNestedInput
    tranches?: PFTrancheUpdateManyWithoutSpcNestedInput
    waterfallTiers?: WaterfallTierUpdateManyWithoutSpcNestedInput
    revenueEvents?: RevenueEventUpdateManyWithoutSpcNestedInput
  }

  export type SPCUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    projectId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    legalType?: EnumSPCLegalTypeFieldUpdateOperationsInput | $Enums.SPCLegalType
    registrationNumber?: NullableStringFieldUpdateOperationsInput | string | null
    incorporationDate?: NullableStringFieldUpdateOperationsInput | string | null
    totalCapital?: NullableIntFieldUpdateOperationsInput | number | null
    totalBudget?: NullableIntFieldUpdateOperationsInput | number | null
    raisedAmount?: IntFieldUpdateOperationsInput | number
    status?: EnumSPCStatusFieldUpdateOperationsInput | $Enums.SPCStatus
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tranches?: PFTrancheUncheckedUpdateManyWithoutSpcNestedInput
    waterfallTiers?: WaterfallTierUncheckedUpdateManyWithoutSpcNestedInput
    revenueEvents?: RevenueEventUncheckedUpdateManyWithoutSpcNestedInput
  }

  export type SPCCreateManyInput = {
    id?: string
    projectId: string
    name: string
    legalType?: $Enums.SPCLegalType
    registrationNumber?: string | null
    incorporationDate?: string | null
    totalCapital?: number | null
    totalBudget?: number | null
    raisedAmount?: number
    status?: $Enums.SPCStatus
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SPCUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    legalType?: EnumSPCLegalTypeFieldUpdateOperationsInput | $Enums.SPCLegalType
    registrationNumber?: NullableStringFieldUpdateOperationsInput | string | null
    incorporationDate?: NullableStringFieldUpdateOperationsInput | string | null
    totalCapital?: NullableIntFieldUpdateOperationsInput | number | null
    totalBudget?: NullableIntFieldUpdateOperationsInput | number | null
    raisedAmount?: IntFieldUpdateOperationsInput | number
    status?: EnumSPCStatusFieldUpdateOperationsInput | $Enums.SPCStatus
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SPCUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    projectId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    legalType?: EnumSPCLegalTypeFieldUpdateOperationsInput | $Enums.SPCLegalType
    registrationNumber?: NullableStringFieldUpdateOperationsInput | string | null
    incorporationDate?: NullableStringFieldUpdateOperationsInput | string | null
    totalCapital?: NullableIntFieldUpdateOperationsInput | number | null
    totalBudget?: NullableIntFieldUpdateOperationsInput | number | null
    raisedAmount?: IntFieldUpdateOperationsInput | number
    status?: EnumSPCStatusFieldUpdateOperationsInput | $Enums.SPCStatus
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PFTrancheCreateInput = {
    id?: string
    name: string
    type: $Enums.TrancheType
    priority: number
    targetAmount: number
    raisedAmount?: number
    interestRate?: number | null
    targetReturn?: number | null
    termMonths?: number | null
    status?: $Enums.TrancheStatus
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    spc: SPCCreateNestedOneWithoutTranchesInput
    investors?: PFTrancheInvestorCreateNestedManyWithoutTrancheInput
    waterfallTiers?: WaterfallTierCreateNestedManyWithoutTrancheInput
  }

  export type PFTrancheUncheckedCreateInput = {
    id?: string
    spcId: string
    name: string
    type: $Enums.TrancheType
    priority: number
    targetAmount: number
    raisedAmount?: number
    interestRate?: number | null
    targetReturn?: number | null
    termMonths?: number | null
    status?: $Enums.TrancheStatus
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    investors?: PFTrancheInvestorUncheckedCreateNestedManyWithoutTrancheInput
    waterfallTiers?: WaterfallTierUncheckedCreateNestedManyWithoutTrancheInput
  }

  export type PFTrancheUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: EnumTrancheTypeFieldUpdateOperationsInput | $Enums.TrancheType
    priority?: IntFieldUpdateOperationsInput | number
    targetAmount?: IntFieldUpdateOperationsInput | number
    raisedAmount?: IntFieldUpdateOperationsInput | number
    interestRate?: NullableFloatFieldUpdateOperationsInput | number | null
    targetReturn?: NullableFloatFieldUpdateOperationsInput | number | null
    termMonths?: NullableIntFieldUpdateOperationsInput | number | null
    status?: EnumTrancheStatusFieldUpdateOperationsInput | $Enums.TrancheStatus
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    spc?: SPCUpdateOneRequiredWithoutTranchesNestedInput
    investors?: PFTrancheInvestorUpdateManyWithoutTrancheNestedInput
    waterfallTiers?: WaterfallTierUpdateManyWithoutTrancheNestedInput
  }

  export type PFTrancheUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    spcId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: EnumTrancheTypeFieldUpdateOperationsInput | $Enums.TrancheType
    priority?: IntFieldUpdateOperationsInput | number
    targetAmount?: IntFieldUpdateOperationsInput | number
    raisedAmount?: IntFieldUpdateOperationsInput | number
    interestRate?: NullableFloatFieldUpdateOperationsInput | number | null
    targetReturn?: NullableFloatFieldUpdateOperationsInput | number | null
    termMonths?: NullableIntFieldUpdateOperationsInput | number | null
    status?: EnumTrancheStatusFieldUpdateOperationsInput | $Enums.TrancheStatus
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    investors?: PFTrancheInvestorUncheckedUpdateManyWithoutTrancheNestedInput
    waterfallTiers?: WaterfallTierUncheckedUpdateManyWithoutTrancheNestedInput
  }

  export type PFTrancheCreateManyInput = {
    id?: string
    spcId: string
    name: string
    type: $Enums.TrancheType
    priority: number
    targetAmount: number
    raisedAmount?: number
    interestRate?: number | null
    targetReturn?: number | null
    termMonths?: number | null
    status?: $Enums.TrancheStatus
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PFTrancheUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: EnumTrancheTypeFieldUpdateOperationsInput | $Enums.TrancheType
    priority?: IntFieldUpdateOperationsInput | number
    targetAmount?: IntFieldUpdateOperationsInput | number
    raisedAmount?: IntFieldUpdateOperationsInput | number
    interestRate?: NullableFloatFieldUpdateOperationsInput | number | null
    targetReturn?: NullableFloatFieldUpdateOperationsInput | number | null
    termMonths?: NullableIntFieldUpdateOperationsInput | number | null
    status?: EnumTrancheStatusFieldUpdateOperationsInput | $Enums.TrancheStatus
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PFTrancheUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    spcId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: EnumTrancheTypeFieldUpdateOperationsInput | $Enums.TrancheType
    priority?: IntFieldUpdateOperationsInput | number
    targetAmount?: IntFieldUpdateOperationsInput | number
    raisedAmount?: IntFieldUpdateOperationsInput | number
    interestRate?: NullableFloatFieldUpdateOperationsInput | number | null
    targetReturn?: NullableFloatFieldUpdateOperationsInput | number | null
    termMonths?: NullableIntFieldUpdateOperationsInput | number | null
    status?: EnumTrancheStatusFieldUpdateOperationsInput | $Enums.TrancheStatus
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PFTrancheInvestorCreateInput = {
    id?: string
    amount: number
    percentage?: number | null
    joinedAt?: Date | string
    notes?: string | null
    tranche: PFTrancheCreateNestedOneWithoutInvestorsInput
    investor: InvestorCreateNestedOneWithoutTranchePositionsInput
  }

  export type PFTrancheInvestorUncheckedCreateInput = {
    id?: string
    trancheId: string
    investorId: string
    amount: number
    percentage?: number | null
    joinedAt?: Date | string
    notes?: string | null
  }

  export type PFTrancheInvestorUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    amount?: IntFieldUpdateOperationsInput | number
    percentage?: NullableFloatFieldUpdateOperationsInput | number | null
    joinedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    tranche?: PFTrancheUpdateOneRequiredWithoutInvestorsNestedInput
    investor?: InvestorUpdateOneRequiredWithoutTranchePositionsNestedInput
  }

  export type PFTrancheInvestorUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    trancheId?: StringFieldUpdateOperationsInput | string
    investorId?: StringFieldUpdateOperationsInput | string
    amount?: IntFieldUpdateOperationsInput | number
    percentage?: NullableFloatFieldUpdateOperationsInput | number | null
    joinedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type PFTrancheInvestorCreateManyInput = {
    id?: string
    trancheId: string
    investorId: string
    amount: number
    percentage?: number | null
    joinedAt?: Date | string
    notes?: string | null
  }

  export type PFTrancheInvestorUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    amount?: IntFieldUpdateOperationsInput | number
    percentage?: NullableFloatFieldUpdateOperationsInput | number | null
    joinedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type PFTrancheInvestorUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    trancheId?: StringFieldUpdateOperationsInput | string
    investorId?: StringFieldUpdateOperationsInput | string
    amount?: IntFieldUpdateOperationsInput | number
    percentage?: NullableFloatFieldUpdateOperationsInput | number | null
    joinedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type WaterfallTierCreateInput = {
    id?: string
    priority: number
    name: string
    type: $Enums.TierType
    amountCap?: number | null
    percentage?: number | null
    multiplier?: number | null
    description?: string | null
    spc: SPCCreateNestedOneWithoutWaterfallTiersInput
    tranche?: PFTrancheCreateNestedOneWithoutWaterfallTiersInput
  }

  export type WaterfallTierUncheckedCreateInput = {
    id?: string
    spcId: string
    priority: number
    name: string
    type: $Enums.TierType
    trancheId?: string | null
    amountCap?: number | null
    percentage?: number | null
    multiplier?: number | null
    description?: string | null
  }

  export type WaterfallTierUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    priority?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    type?: EnumTierTypeFieldUpdateOperationsInput | $Enums.TierType
    amountCap?: NullableIntFieldUpdateOperationsInput | number | null
    percentage?: NullableFloatFieldUpdateOperationsInput | number | null
    multiplier?: NullableFloatFieldUpdateOperationsInput | number | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    spc?: SPCUpdateOneRequiredWithoutWaterfallTiersNestedInput
    tranche?: PFTrancheUpdateOneWithoutWaterfallTiersNestedInput
  }

  export type WaterfallTierUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    spcId?: StringFieldUpdateOperationsInput | string
    priority?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    type?: EnumTierTypeFieldUpdateOperationsInput | $Enums.TierType
    trancheId?: NullableStringFieldUpdateOperationsInput | string | null
    amountCap?: NullableIntFieldUpdateOperationsInput | number | null
    percentage?: NullableFloatFieldUpdateOperationsInput | number | null
    multiplier?: NullableFloatFieldUpdateOperationsInput | number | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type WaterfallTierCreateManyInput = {
    id?: string
    spcId: string
    priority: number
    name: string
    type: $Enums.TierType
    trancheId?: string | null
    amountCap?: number | null
    percentage?: number | null
    multiplier?: number | null
    description?: string | null
  }

  export type WaterfallTierUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    priority?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    type?: EnumTierTypeFieldUpdateOperationsInput | $Enums.TierType
    amountCap?: NullableIntFieldUpdateOperationsInput | number | null
    percentage?: NullableFloatFieldUpdateOperationsInput | number | null
    multiplier?: NullableFloatFieldUpdateOperationsInput | number | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type WaterfallTierUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    spcId?: StringFieldUpdateOperationsInput | string
    priority?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    type?: EnumTierTypeFieldUpdateOperationsInput | $Enums.TierType
    trancheId?: NullableStringFieldUpdateOperationsInput | string | null
    amountCap?: NullableIntFieldUpdateOperationsInput | number | null
    percentage?: NullableFloatFieldUpdateOperationsInput | number | null
    multiplier?: NullableFloatFieldUpdateOperationsInput | number | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type RevenueEventCreateInput = {
    id?: string
    amount: number
    source: $Enums.RevenueSource
    eventDate: string
    notes?: string | null
    distributionStatus?: string
    createdAt?: Date | string
    spc: SPCCreateNestedOneWithoutRevenueEventsInput
    distributions?: WaterfallDistributionCreateNestedManyWithoutEventInput
  }

  export type RevenueEventUncheckedCreateInput = {
    id?: string
    spcId: string
    amount: number
    source: $Enums.RevenueSource
    eventDate: string
    notes?: string | null
    distributionStatus?: string
    createdAt?: Date | string
    distributions?: WaterfallDistributionUncheckedCreateNestedManyWithoutEventInput
  }

  export type RevenueEventUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    amount?: IntFieldUpdateOperationsInput | number
    source?: EnumRevenueSourceFieldUpdateOperationsInput | $Enums.RevenueSource
    eventDate?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    distributionStatus?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    spc?: SPCUpdateOneRequiredWithoutRevenueEventsNestedInput
    distributions?: WaterfallDistributionUpdateManyWithoutEventNestedInput
  }

  export type RevenueEventUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    spcId?: StringFieldUpdateOperationsInput | string
    amount?: IntFieldUpdateOperationsInput | number
    source?: EnumRevenueSourceFieldUpdateOperationsInput | $Enums.RevenueSource
    eventDate?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    distributionStatus?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    distributions?: WaterfallDistributionUncheckedUpdateManyWithoutEventNestedInput
  }

  export type RevenueEventCreateManyInput = {
    id?: string
    spcId: string
    amount: number
    source: $Enums.RevenueSource
    eventDate: string
    notes?: string | null
    distributionStatus?: string
    createdAt?: Date | string
  }

  export type RevenueEventUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    amount?: IntFieldUpdateOperationsInput | number
    source?: EnumRevenueSourceFieldUpdateOperationsInput | $Enums.RevenueSource
    eventDate?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    distributionStatus?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RevenueEventUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    spcId?: StringFieldUpdateOperationsInput | string
    amount?: IntFieldUpdateOperationsInput | number
    source?: EnumRevenueSourceFieldUpdateOperationsInput | $Enums.RevenueSource
    eventDate?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    distributionStatus?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WaterfallDistributionCreateInput = {
    id?: string
    tierId: string
    tierName: string
    tierPriority: number
    allocatedAmount: number
    cumulativePaid: number
    isFullySatisfied?: boolean
    calculatedAt?: Date | string
    event: RevenueEventCreateNestedOneWithoutDistributionsInput
  }

  export type WaterfallDistributionUncheckedCreateInput = {
    id?: string
    eventId: string
    tierId: string
    tierName: string
    tierPriority: number
    allocatedAmount: number
    cumulativePaid: number
    isFullySatisfied?: boolean
    calculatedAt?: Date | string
  }

  export type WaterfallDistributionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tierId?: StringFieldUpdateOperationsInput | string
    tierName?: StringFieldUpdateOperationsInput | string
    tierPriority?: IntFieldUpdateOperationsInput | number
    allocatedAmount?: IntFieldUpdateOperationsInput | number
    cumulativePaid?: IntFieldUpdateOperationsInput | number
    isFullySatisfied?: BoolFieldUpdateOperationsInput | boolean
    calculatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    event?: RevenueEventUpdateOneRequiredWithoutDistributionsNestedInput
  }

  export type WaterfallDistributionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    eventId?: StringFieldUpdateOperationsInput | string
    tierId?: StringFieldUpdateOperationsInput | string
    tierName?: StringFieldUpdateOperationsInput | string
    tierPriority?: IntFieldUpdateOperationsInput | number
    allocatedAmount?: IntFieldUpdateOperationsInput | number
    cumulativePaid?: IntFieldUpdateOperationsInput | number
    isFullySatisfied?: BoolFieldUpdateOperationsInput | boolean
    calculatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WaterfallDistributionCreateManyInput = {
    id?: string
    eventId: string
    tierId: string
    tierName: string
    tierPriority: number
    allocatedAmount: number
    cumulativePaid: number
    isFullySatisfied?: boolean
    calculatedAt?: Date | string
  }

  export type WaterfallDistributionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tierId?: StringFieldUpdateOperationsInput | string
    tierName?: StringFieldUpdateOperationsInput | string
    tierPriority?: IntFieldUpdateOperationsInput | number
    allocatedAmount?: IntFieldUpdateOperationsInput | number
    cumulativePaid?: IntFieldUpdateOperationsInput | number
    isFullySatisfied?: BoolFieldUpdateOperationsInput | boolean
    calculatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WaterfallDistributionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    eventId?: StringFieldUpdateOperationsInput | string
    tierId?: StringFieldUpdateOperationsInput | string
    tierName?: StringFieldUpdateOperationsInput | string
    tierPriority?: IntFieldUpdateOperationsInput | number
    allocatedAmount?: IntFieldUpdateOperationsInput | number
    cumulativePaid?: IntFieldUpdateOperationsInput | number
    isFullySatisfied?: BoolFieldUpdateOperationsInput | boolean
    calculatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type EnumInvestorTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.InvestorType | EnumInvestorTypeFieldRefInput<$PrismaModel>
    in?: $Enums.InvestorType[]
    notIn?: $Enums.InvestorType[]
    not?: NestedEnumInvestorTypeFilter<$PrismaModel> | $Enums.InvestorType
  }

  export type EnumInvestorTierFilter<$PrismaModel = never> = {
    equals?: $Enums.InvestorTier | EnumInvestorTierFieldRefInput<$PrismaModel>
    in?: $Enums.InvestorTier[]
    notIn?: $Enums.InvestorTier[]
    not?: NestedEnumInvestorTierFilter<$PrismaModel> | $Enums.InvestorTier
  }

  export type EnumInvestorStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.InvestorStatus | EnumInvestorStatusFieldRefInput<$PrismaModel>
    in?: $Enums.InvestorStatus[]
    notIn?: $Enums.InvestorStatus[]
    not?: NestedEnumInvestorStatusFilter<$PrismaModel> | $Enums.InvestorStatus
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type InvestorGroupMemberListRelationFilter = {
    every?: InvestorGroupMemberWhereInput
    some?: InvestorGroupMemberWhereInput
    none?: InvestorGroupMemberWhereInput
  }

  export type PFTrancheInvestorListRelationFilter = {
    every?: PFTrancheInvestorWhereInput
    some?: PFTrancheInvestorWhereInput
    none?: PFTrancheInvestorWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type InvestorGroupMemberOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type PFTrancheInvestorOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type InvestorCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    nameEn?: SortOrder
    type?: SortOrder
    tier?: SortOrder
    status?: SortOrder
    country?: SortOrder
    region?: SortOrder
    contactName?: SortOrder
    contactEmail?: SortOrder
    contactPhone?: SortOrder
    investmentCapacity?: SortOrder
    minTicket?: SortOrder
    maxTicket?: SortOrder
    preferredGenres?: SortOrder
    preferredBudgetRange?: SortOrder
    pastInvestments?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type InvestorAvgOrderByAggregateInput = {
    investmentCapacity?: SortOrder
    minTicket?: SortOrder
    maxTicket?: SortOrder
  }

  export type InvestorMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    nameEn?: SortOrder
    type?: SortOrder
    tier?: SortOrder
    status?: SortOrder
    country?: SortOrder
    region?: SortOrder
    contactName?: SortOrder
    contactEmail?: SortOrder
    contactPhone?: SortOrder
    investmentCapacity?: SortOrder
    minTicket?: SortOrder
    maxTicket?: SortOrder
    preferredGenres?: SortOrder
    preferredBudgetRange?: SortOrder
    pastInvestments?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type InvestorMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    nameEn?: SortOrder
    type?: SortOrder
    tier?: SortOrder
    status?: SortOrder
    country?: SortOrder
    region?: SortOrder
    contactName?: SortOrder
    contactEmail?: SortOrder
    contactPhone?: SortOrder
    investmentCapacity?: SortOrder
    minTicket?: SortOrder
    maxTicket?: SortOrder
    preferredGenres?: SortOrder
    preferredBudgetRange?: SortOrder
    pastInvestments?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type InvestorSumOrderByAggregateInput = {
    investmentCapacity?: SortOrder
    minTicket?: SortOrder
    maxTicket?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type EnumInvestorTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.InvestorType | EnumInvestorTypeFieldRefInput<$PrismaModel>
    in?: $Enums.InvestorType[]
    notIn?: $Enums.InvestorType[]
    not?: NestedEnumInvestorTypeWithAggregatesFilter<$PrismaModel> | $Enums.InvestorType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumInvestorTypeFilter<$PrismaModel>
    _max?: NestedEnumInvestorTypeFilter<$PrismaModel>
  }

  export type EnumInvestorTierWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.InvestorTier | EnumInvestorTierFieldRefInput<$PrismaModel>
    in?: $Enums.InvestorTier[]
    notIn?: $Enums.InvestorTier[]
    not?: NestedEnumInvestorTierWithAggregatesFilter<$PrismaModel> | $Enums.InvestorTier
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumInvestorTierFilter<$PrismaModel>
    _max?: NestedEnumInvestorTierFilter<$PrismaModel>
  }

  export type EnumInvestorStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.InvestorStatus | EnumInvestorStatusFieldRefInput<$PrismaModel>
    in?: $Enums.InvestorStatus[]
    notIn?: $Enums.InvestorStatus[]
    not?: NestedEnumInvestorStatusWithAggregatesFilter<$PrismaModel> | $Enums.InvestorStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumInvestorStatusFilter<$PrismaModel>
    _max?: NestedEnumInvestorStatusFilter<$PrismaModel>
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type EnumInvestorGroupTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.InvestorGroupType | EnumInvestorGroupTypeFieldRefInput<$PrismaModel>
    in?: $Enums.InvestorGroupType[]
    notIn?: $Enums.InvestorGroupType[]
    not?: NestedEnumInvestorGroupTypeFilter<$PrismaModel> | $Enums.InvestorGroupType
  }

  export type EnumInvestorGroupStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.InvestorGroupStatus | EnumInvestorGroupStatusFieldRefInput<$PrismaModel>
    in?: $Enums.InvestorGroupStatus[]
    notIn?: $Enums.InvestorGroupStatus[]
    not?: NestedEnumInvestorGroupStatusFilter<$PrismaModel> | $Enums.InvestorGroupStatus
  }

  export type InvestorGroupCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    type?: SortOrder
    managingFirm?: SortOrder
    totalCommitment?: SortOrder
    status?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type InvestorGroupAvgOrderByAggregateInput = {
    totalCommitment?: SortOrder
  }

  export type InvestorGroupMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    type?: SortOrder
    managingFirm?: SortOrder
    totalCommitment?: SortOrder
    status?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type InvestorGroupMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    type?: SortOrder
    managingFirm?: SortOrder
    totalCommitment?: SortOrder
    status?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type InvestorGroupSumOrderByAggregateInput = {
    totalCommitment?: SortOrder
  }

  export type EnumInvestorGroupTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.InvestorGroupType | EnumInvestorGroupTypeFieldRefInput<$PrismaModel>
    in?: $Enums.InvestorGroupType[]
    notIn?: $Enums.InvestorGroupType[]
    not?: NestedEnumInvestorGroupTypeWithAggregatesFilter<$PrismaModel> | $Enums.InvestorGroupType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumInvestorGroupTypeFilter<$PrismaModel>
    _max?: NestedEnumInvestorGroupTypeFilter<$PrismaModel>
  }

  export type EnumInvestorGroupStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.InvestorGroupStatus | EnumInvestorGroupStatusFieldRefInput<$PrismaModel>
    in?: $Enums.InvestorGroupStatus[]
    notIn?: $Enums.InvestorGroupStatus[]
    not?: NestedEnumInvestorGroupStatusWithAggregatesFilter<$PrismaModel> | $Enums.InvestorGroupStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumInvestorGroupStatusFilter<$PrismaModel>
    _max?: NestedEnumInvestorGroupStatusFilter<$PrismaModel>
  }

  export type InvestorGroupScalarRelationFilter = {
    is?: InvestorGroupWhereInput
    isNot?: InvestorGroupWhereInput
  }

  export type InvestorScalarRelationFilter = {
    is?: InvestorWhereInput
    isNot?: InvestorWhereInput
  }

  export type InvestorGroupMemberGroupIdInvestorIdCompoundUniqueInput = {
    groupId: string
    investorId: string
  }

  export type InvestorGroupMemberCountOrderByAggregateInput = {
    id?: SortOrder
    groupId?: SortOrder
    investorId?: SortOrder
    commitment?: SortOrder
    role?: SortOrder
    joinedAt?: SortOrder
  }

  export type InvestorGroupMemberAvgOrderByAggregateInput = {
    commitment?: SortOrder
  }

  export type InvestorGroupMemberMaxOrderByAggregateInput = {
    id?: SortOrder
    groupId?: SortOrder
    investorId?: SortOrder
    commitment?: SortOrder
    role?: SortOrder
    joinedAt?: SortOrder
  }

  export type InvestorGroupMemberMinOrderByAggregateInput = {
    id?: SortOrder
    groupId?: SortOrder
    investorId?: SortOrder
    commitment?: SortOrder
    role?: SortOrder
    joinedAt?: SortOrder
  }

  export type InvestorGroupMemberSumOrderByAggregateInput = {
    commitment?: SortOrder
  }

  export type EnumProjectStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.ProjectStatus | EnumProjectStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ProjectStatus[]
    notIn?: $Enums.ProjectStatus[]
    not?: NestedEnumProjectStatusFilter<$PrismaModel> | $Enums.ProjectStatus
  }

  export type SPCListRelationFilter = {
    every?: SPCWhereInput
    some?: SPCWhereInput
    none?: SPCWhereInput
  }

  export type SPCOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type FilmProjectCountOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    titleEn?: SortOrder
    genre?: SortOrder
    logline?: SortOrder
    totalBudget?: SortOrder
    budgetBreakdown?: SortOrder
    status?: SortOrder
    targetReleaseDate?: SortOrder
    scriptId?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type FilmProjectAvgOrderByAggregateInput = {
    totalBudget?: SortOrder
  }

  export type FilmProjectMaxOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    titleEn?: SortOrder
    genre?: SortOrder
    logline?: SortOrder
    totalBudget?: SortOrder
    budgetBreakdown?: SortOrder
    status?: SortOrder
    targetReleaseDate?: SortOrder
    scriptId?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type FilmProjectMinOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    titleEn?: SortOrder
    genre?: SortOrder
    logline?: SortOrder
    totalBudget?: SortOrder
    budgetBreakdown?: SortOrder
    status?: SortOrder
    targetReleaseDate?: SortOrder
    scriptId?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type FilmProjectSumOrderByAggregateInput = {
    totalBudget?: SortOrder
  }

  export type EnumProjectStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ProjectStatus | EnumProjectStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ProjectStatus[]
    notIn?: $Enums.ProjectStatus[]
    not?: NestedEnumProjectStatusWithAggregatesFilter<$PrismaModel> | $Enums.ProjectStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumProjectStatusFilter<$PrismaModel>
    _max?: NestedEnumProjectStatusFilter<$PrismaModel>
  }

  export type EnumSPCLegalTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.SPCLegalType | EnumSPCLegalTypeFieldRefInput<$PrismaModel>
    in?: $Enums.SPCLegalType[]
    notIn?: $Enums.SPCLegalType[]
    not?: NestedEnumSPCLegalTypeFilter<$PrismaModel> | $Enums.SPCLegalType
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type EnumSPCStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.SPCStatus | EnumSPCStatusFieldRefInput<$PrismaModel>
    in?: $Enums.SPCStatus[]
    notIn?: $Enums.SPCStatus[]
    not?: NestedEnumSPCStatusFilter<$PrismaModel> | $Enums.SPCStatus
  }

  export type FilmProjectScalarRelationFilter = {
    is?: FilmProjectWhereInput
    isNot?: FilmProjectWhereInput
  }

  export type PFTrancheListRelationFilter = {
    every?: PFTrancheWhereInput
    some?: PFTrancheWhereInput
    none?: PFTrancheWhereInput
  }

  export type WaterfallTierListRelationFilter = {
    every?: WaterfallTierWhereInput
    some?: WaterfallTierWhereInput
    none?: WaterfallTierWhereInput
  }

  export type RevenueEventListRelationFilter = {
    every?: RevenueEventWhereInput
    some?: RevenueEventWhereInput
    none?: RevenueEventWhereInput
  }

  export type PFTrancheOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type WaterfallTierOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type RevenueEventOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type SPCCountOrderByAggregateInput = {
    id?: SortOrder
    projectId?: SortOrder
    name?: SortOrder
    legalType?: SortOrder
    registrationNumber?: SortOrder
    incorporationDate?: SortOrder
    totalCapital?: SortOrder
    totalBudget?: SortOrder
    raisedAmount?: SortOrder
    status?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SPCAvgOrderByAggregateInput = {
    totalCapital?: SortOrder
    totalBudget?: SortOrder
    raisedAmount?: SortOrder
  }

  export type SPCMaxOrderByAggregateInput = {
    id?: SortOrder
    projectId?: SortOrder
    name?: SortOrder
    legalType?: SortOrder
    registrationNumber?: SortOrder
    incorporationDate?: SortOrder
    totalCapital?: SortOrder
    totalBudget?: SortOrder
    raisedAmount?: SortOrder
    status?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SPCMinOrderByAggregateInput = {
    id?: SortOrder
    projectId?: SortOrder
    name?: SortOrder
    legalType?: SortOrder
    registrationNumber?: SortOrder
    incorporationDate?: SortOrder
    totalCapital?: SortOrder
    totalBudget?: SortOrder
    raisedAmount?: SortOrder
    status?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SPCSumOrderByAggregateInput = {
    totalCapital?: SortOrder
    totalBudget?: SortOrder
    raisedAmount?: SortOrder
  }

  export type EnumSPCLegalTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.SPCLegalType | EnumSPCLegalTypeFieldRefInput<$PrismaModel>
    in?: $Enums.SPCLegalType[]
    notIn?: $Enums.SPCLegalType[]
    not?: NestedEnumSPCLegalTypeWithAggregatesFilter<$PrismaModel> | $Enums.SPCLegalType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumSPCLegalTypeFilter<$PrismaModel>
    _max?: NestedEnumSPCLegalTypeFilter<$PrismaModel>
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type EnumSPCStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.SPCStatus | EnumSPCStatusFieldRefInput<$PrismaModel>
    in?: $Enums.SPCStatus[]
    notIn?: $Enums.SPCStatus[]
    not?: NestedEnumSPCStatusWithAggregatesFilter<$PrismaModel> | $Enums.SPCStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumSPCStatusFilter<$PrismaModel>
    _max?: NestedEnumSPCStatusFilter<$PrismaModel>
  }

  export type EnumTrancheTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.TrancheType | EnumTrancheTypeFieldRefInput<$PrismaModel>
    in?: $Enums.TrancheType[]
    notIn?: $Enums.TrancheType[]
    not?: NestedEnumTrancheTypeFilter<$PrismaModel> | $Enums.TrancheType
  }

  export type FloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type EnumTrancheStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.TrancheStatus | EnumTrancheStatusFieldRefInput<$PrismaModel>
    in?: $Enums.TrancheStatus[]
    notIn?: $Enums.TrancheStatus[]
    not?: NestedEnumTrancheStatusFilter<$PrismaModel> | $Enums.TrancheStatus
  }

  export type SPCScalarRelationFilter = {
    is?: SPCWhereInput
    isNot?: SPCWhereInput
  }

  export type PFTrancheCountOrderByAggregateInput = {
    id?: SortOrder
    spcId?: SortOrder
    name?: SortOrder
    type?: SortOrder
    priority?: SortOrder
    targetAmount?: SortOrder
    raisedAmount?: SortOrder
    interestRate?: SortOrder
    targetReturn?: SortOrder
    termMonths?: SortOrder
    status?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PFTrancheAvgOrderByAggregateInput = {
    priority?: SortOrder
    targetAmount?: SortOrder
    raisedAmount?: SortOrder
    interestRate?: SortOrder
    targetReturn?: SortOrder
    termMonths?: SortOrder
  }

  export type PFTrancheMaxOrderByAggregateInput = {
    id?: SortOrder
    spcId?: SortOrder
    name?: SortOrder
    type?: SortOrder
    priority?: SortOrder
    targetAmount?: SortOrder
    raisedAmount?: SortOrder
    interestRate?: SortOrder
    targetReturn?: SortOrder
    termMonths?: SortOrder
    status?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PFTrancheMinOrderByAggregateInput = {
    id?: SortOrder
    spcId?: SortOrder
    name?: SortOrder
    type?: SortOrder
    priority?: SortOrder
    targetAmount?: SortOrder
    raisedAmount?: SortOrder
    interestRate?: SortOrder
    targetReturn?: SortOrder
    termMonths?: SortOrder
    status?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PFTrancheSumOrderByAggregateInput = {
    priority?: SortOrder
    targetAmount?: SortOrder
    raisedAmount?: SortOrder
    interestRate?: SortOrder
    targetReturn?: SortOrder
    termMonths?: SortOrder
  }

  export type EnumTrancheTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TrancheType | EnumTrancheTypeFieldRefInput<$PrismaModel>
    in?: $Enums.TrancheType[]
    notIn?: $Enums.TrancheType[]
    not?: NestedEnumTrancheTypeWithAggregatesFilter<$PrismaModel> | $Enums.TrancheType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTrancheTypeFilter<$PrismaModel>
    _max?: NestedEnumTrancheTypeFilter<$PrismaModel>
  }

  export type FloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type EnumTrancheStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TrancheStatus | EnumTrancheStatusFieldRefInput<$PrismaModel>
    in?: $Enums.TrancheStatus[]
    notIn?: $Enums.TrancheStatus[]
    not?: NestedEnumTrancheStatusWithAggregatesFilter<$PrismaModel> | $Enums.TrancheStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTrancheStatusFilter<$PrismaModel>
    _max?: NestedEnumTrancheStatusFilter<$PrismaModel>
  }

  export type PFTrancheScalarRelationFilter = {
    is?: PFTrancheWhereInput
    isNot?: PFTrancheWhereInput
  }

  export type PFTrancheInvestorTrancheIdInvestorIdCompoundUniqueInput = {
    trancheId: string
    investorId: string
  }

  export type PFTrancheInvestorCountOrderByAggregateInput = {
    id?: SortOrder
    trancheId?: SortOrder
    investorId?: SortOrder
    amount?: SortOrder
    percentage?: SortOrder
    joinedAt?: SortOrder
    notes?: SortOrder
  }

  export type PFTrancheInvestorAvgOrderByAggregateInput = {
    amount?: SortOrder
    percentage?: SortOrder
  }

  export type PFTrancheInvestorMaxOrderByAggregateInput = {
    id?: SortOrder
    trancheId?: SortOrder
    investorId?: SortOrder
    amount?: SortOrder
    percentage?: SortOrder
    joinedAt?: SortOrder
    notes?: SortOrder
  }

  export type PFTrancheInvestorMinOrderByAggregateInput = {
    id?: SortOrder
    trancheId?: SortOrder
    investorId?: SortOrder
    amount?: SortOrder
    percentage?: SortOrder
    joinedAt?: SortOrder
    notes?: SortOrder
  }

  export type PFTrancheInvestorSumOrderByAggregateInput = {
    amount?: SortOrder
    percentage?: SortOrder
  }

  export type EnumTierTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.TierType | EnumTierTypeFieldRefInput<$PrismaModel>
    in?: $Enums.TierType[]
    notIn?: $Enums.TierType[]
    not?: NestedEnumTierTypeFilter<$PrismaModel> | $Enums.TierType
  }

  export type PFTrancheNullableScalarRelationFilter = {
    is?: PFTrancheWhereInput | null
    isNot?: PFTrancheWhereInput | null
  }

  export type WaterfallTierCountOrderByAggregateInput = {
    id?: SortOrder
    spcId?: SortOrder
    priority?: SortOrder
    name?: SortOrder
    type?: SortOrder
    trancheId?: SortOrder
    amountCap?: SortOrder
    percentage?: SortOrder
    multiplier?: SortOrder
    description?: SortOrder
  }

  export type WaterfallTierAvgOrderByAggregateInput = {
    priority?: SortOrder
    amountCap?: SortOrder
    percentage?: SortOrder
    multiplier?: SortOrder
  }

  export type WaterfallTierMaxOrderByAggregateInput = {
    id?: SortOrder
    spcId?: SortOrder
    priority?: SortOrder
    name?: SortOrder
    type?: SortOrder
    trancheId?: SortOrder
    amountCap?: SortOrder
    percentage?: SortOrder
    multiplier?: SortOrder
    description?: SortOrder
  }

  export type WaterfallTierMinOrderByAggregateInput = {
    id?: SortOrder
    spcId?: SortOrder
    priority?: SortOrder
    name?: SortOrder
    type?: SortOrder
    trancheId?: SortOrder
    amountCap?: SortOrder
    percentage?: SortOrder
    multiplier?: SortOrder
    description?: SortOrder
  }

  export type WaterfallTierSumOrderByAggregateInput = {
    priority?: SortOrder
    amountCap?: SortOrder
    percentage?: SortOrder
    multiplier?: SortOrder
  }

  export type EnumTierTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TierType | EnumTierTypeFieldRefInput<$PrismaModel>
    in?: $Enums.TierType[]
    notIn?: $Enums.TierType[]
    not?: NestedEnumTierTypeWithAggregatesFilter<$PrismaModel> | $Enums.TierType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTierTypeFilter<$PrismaModel>
    _max?: NestedEnumTierTypeFilter<$PrismaModel>
  }

  export type EnumRevenueSourceFilter<$PrismaModel = never> = {
    equals?: $Enums.RevenueSource | EnumRevenueSourceFieldRefInput<$PrismaModel>
    in?: $Enums.RevenueSource[]
    notIn?: $Enums.RevenueSource[]
    not?: NestedEnumRevenueSourceFilter<$PrismaModel> | $Enums.RevenueSource
  }

  export type WaterfallDistributionListRelationFilter = {
    every?: WaterfallDistributionWhereInput
    some?: WaterfallDistributionWhereInput
    none?: WaterfallDistributionWhereInput
  }

  export type WaterfallDistributionOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type RevenueEventCountOrderByAggregateInput = {
    id?: SortOrder
    spcId?: SortOrder
    amount?: SortOrder
    source?: SortOrder
    eventDate?: SortOrder
    notes?: SortOrder
    distributionStatus?: SortOrder
    createdAt?: SortOrder
  }

  export type RevenueEventAvgOrderByAggregateInput = {
    amount?: SortOrder
  }

  export type RevenueEventMaxOrderByAggregateInput = {
    id?: SortOrder
    spcId?: SortOrder
    amount?: SortOrder
    source?: SortOrder
    eventDate?: SortOrder
    notes?: SortOrder
    distributionStatus?: SortOrder
    createdAt?: SortOrder
  }

  export type RevenueEventMinOrderByAggregateInput = {
    id?: SortOrder
    spcId?: SortOrder
    amount?: SortOrder
    source?: SortOrder
    eventDate?: SortOrder
    notes?: SortOrder
    distributionStatus?: SortOrder
    createdAt?: SortOrder
  }

  export type RevenueEventSumOrderByAggregateInput = {
    amount?: SortOrder
  }

  export type EnumRevenueSourceWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.RevenueSource | EnumRevenueSourceFieldRefInput<$PrismaModel>
    in?: $Enums.RevenueSource[]
    notIn?: $Enums.RevenueSource[]
    not?: NestedEnumRevenueSourceWithAggregatesFilter<$PrismaModel> | $Enums.RevenueSource
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumRevenueSourceFilter<$PrismaModel>
    _max?: NestedEnumRevenueSourceFilter<$PrismaModel>
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type RevenueEventScalarRelationFilter = {
    is?: RevenueEventWhereInput
    isNot?: RevenueEventWhereInput
  }

  export type WaterfallDistributionCountOrderByAggregateInput = {
    id?: SortOrder
    eventId?: SortOrder
    tierId?: SortOrder
    tierName?: SortOrder
    tierPriority?: SortOrder
    allocatedAmount?: SortOrder
    cumulativePaid?: SortOrder
    isFullySatisfied?: SortOrder
    calculatedAt?: SortOrder
  }

  export type WaterfallDistributionAvgOrderByAggregateInput = {
    tierPriority?: SortOrder
    allocatedAmount?: SortOrder
    cumulativePaid?: SortOrder
  }

  export type WaterfallDistributionMaxOrderByAggregateInput = {
    id?: SortOrder
    eventId?: SortOrder
    tierId?: SortOrder
    tierName?: SortOrder
    tierPriority?: SortOrder
    allocatedAmount?: SortOrder
    cumulativePaid?: SortOrder
    isFullySatisfied?: SortOrder
    calculatedAt?: SortOrder
  }

  export type WaterfallDistributionMinOrderByAggregateInput = {
    id?: SortOrder
    eventId?: SortOrder
    tierId?: SortOrder
    tierName?: SortOrder
    tierPriority?: SortOrder
    allocatedAmount?: SortOrder
    cumulativePaid?: SortOrder
    isFullySatisfied?: SortOrder
    calculatedAt?: SortOrder
  }

  export type WaterfallDistributionSumOrderByAggregateInput = {
    tierPriority?: SortOrder
    allocatedAmount?: SortOrder
    cumulativePaid?: SortOrder
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type InvestorGroupMemberCreateNestedManyWithoutInvestorInput = {
    create?: XOR<InvestorGroupMemberCreateWithoutInvestorInput, InvestorGroupMemberUncheckedCreateWithoutInvestorInput> | InvestorGroupMemberCreateWithoutInvestorInput[] | InvestorGroupMemberUncheckedCreateWithoutInvestorInput[]
    connectOrCreate?: InvestorGroupMemberCreateOrConnectWithoutInvestorInput | InvestorGroupMemberCreateOrConnectWithoutInvestorInput[]
    createMany?: InvestorGroupMemberCreateManyInvestorInputEnvelope
    connect?: InvestorGroupMemberWhereUniqueInput | InvestorGroupMemberWhereUniqueInput[]
  }

  export type PFTrancheInvestorCreateNestedManyWithoutInvestorInput = {
    create?: XOR<PFTrancheInvestorCreateWithoutInvestorInput, PFTrancheInvestorUncheckedCreateWithoutInvestorInput> | PFTrancheInvestorCreateWithoutInvestorInput[] | PFTrancheInvestorUncheckedCreateWithoutInvestorInput[]
    connectOrCreate?: PFTrancheInvestorCreateOrConnectWithoutInvestorInput | PFTrancheInvestorCreateOrConnectWithoutInvestorInput[]
    createMany?: PFTrancheInvestorCreateManyInvestorInputEnvelope
    connect?: PFTrancheInvestorWhereUniqueInput | PFTrancheInvestorWhereUniqueInput[]
  }

  export type InvestorGroupMemberUncheckedCreateNestedManyWithoutInvestorInput = {
    create?: XOR<InvestorGroupMemberCreateWithoutInvestorInput, InvestorGroupMemberUncheckedCreateWithoutInvestorInput> | InvestorGroupMemberCreateWithoutInvestorInput[] | InvestorGroupMemberUncheckedCreateWithoutInvestorInput[]
    connectOrCreate?: InvestorGroupMemberCreateOrConnectWithoutInvestorInput | InvestorGroupMemberCreateOrConnectWithoutInvestorInput[]
    createMany?: InvestorGroupMemberCreateManyInvestorInputEnvelope
    connect?: InvestorGroupMemberWhereUniqueInput | InvestorGroupMemberWhereUniqueInput[]
  }

  export type PFTrancheInvestorUncheckedCreateNestedManyWithoutInvestorInput = {
    create?: XOR<PFTrancheInvestorCreateWithoutInvestorInput, PFTrancheInvestorUncheckedCreateWithoutInvestorInput> | PFTrancheInvestorCreateWithoutInvestorInput[] | PFTrancheInvestorUncheckedCreateWithoutInvestorInput[]
    connectOrCreate?: PFTrancheInvestorCreateOrConnectWithoutInvestorInput | PFTrancheInvestorCreateOrConnectWithoutInvestorInput[]
    createMany?: PFTrancheInvestorCreateManyInvestorInputEnvelope
    connect?: PFTrancheInvestorWhereUniqueInput | PFTrancheInvestorWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type EnumInvestorTypeFieldUpdateOperationsInput = {
    set?: $Enums.InvestorType
  }

  export type EnumInvestorTierFieldUpdateOperationsInput = {
    set?: $Enums.InvestorTier
  }

  export type EnumInvestorStatusFieldUpdateOperationsInput = {
    set?: $Enums.InvestorStatus
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type InvestorGroupMemberUpdateManyWithoutInvestorNestedInput = {
    create?: XOR<InvestorGroupMemberCreateWithoutInvestorInput, InvestorGroupMemberUncheckedCreateWithoutInvestorInput> | InvestorGroupMemberCreateWithoutInvestorInput[] | InvestorGroupMemberUncheckedCreateWithoutInvestorInput[]
    connectOrCreate?: InvestorGroupMemberCreateOrConnectWithoutInvestorInput | InvestorGroupMemberCreateOrConnectWithoutInvestorInput[]
    upsert?: InvestorGroupMemberUpsertWithWhereUniqueWithoutInvestorInput | InvestorGroupMemberUpsertWithWhereUniqueWithoutInvestorInput[]
    createMany?: InvestorGroupMemberCreateManyInvestorInputEnvelope
    set?: InvestorGroupMemberWhereUniqueInput | InvestorGroupMemberWhereUniqueInput[]
    disconnect?: InvestorGroupMemberWhereUniqueInput | InvestorGroupMemberWhereUniqueInput[]
    delete?: InvestorGroupMemberWhereUniqueInput | InvestorGroupMemberWhereUniqueInput[]
    connect?: InvestorGroupMemberWhereUniqueInput | InvestorGroupMemberWhereUniqueInput[]
    update?: InvestorGroupMemberUpdateWithWhereUniqueWithoutInvestorInput | InvestorGroupMemberUpdateWithWhereUniqueWithoutInvestorInput[]
    updateMany?: InvestorGroupMemberUpdateManyWithWhereWithoutInvestorInput | InvestorGroupMemberUpdateManyWithWhereWithoutInvestorInput[]
    deleteMany?: InvestorGroupMemberScalarWhereInput | InvestorGroupMemberScalarWhereInput[]
  }

  export type PFTrancheInvestorUpdateManyWithoutInvestorNestedInput = {
    create?: XOR<PFTrancheInvestorCreateWithoutInvestorInput, PFTrancheInvestorUncheckedCreateWithoutInvestorInput> | PFTrancheInvestorCreateWithoutInvestorInput[] | PFTrancheInvestorUncheckedCreateWithoutInvestorInput[]
    connectOrCreate?: PFTrancheInvestorCreateOrConnectWithoutInvestorInput | PFTrancheInvestorCreateOrConnectWithoutInvestorInput[]
    upsert?: PFTrancheInvestorUpsertWithWhereUniqueWithoutInvestorInput | PFTrancheInvestorUpsertWithWhereUniqueWithoutInvestorInput[]
    createMany?: PFTrancheInvestorCreateManyInvestorInputEnvelope
    set?: PFTrancheInvestorWhereUniqueInput | PFTrancheInvestorWhereUniqueInput[]
    disconnect?: PFTrancheInvestorWhereUniqueInput | PFTrancheInvestorWhereUniqueInput[]
    delete?: PFTrancheInvestorWhereUniqueInput | PFTrancheInvestorWhereUniqueInput[]
    connect?: PFTrancheInvestorWhereUniqueInput | PFTrancheInvestorWhereUniqueInput[]
    update?: PFTrancheInvestorUpdateWithWhereUniqueWithoutInvestorInput | PFTrancheInvestorUpdateWithWhereUniqueWithoutInvestorInput[]
    updateMany?: PFTrancheInvestorUpdateManyWithWhereWithoutInvestorInput | PFTrancheInvestorUpdateManyWithWhereWithoutInvestorInput[]
    deleteMany?: PFTrancheInvestorScalarWhereInput | PFTrancheInvestorScalarWhereInput[]
  }

  export type InvestorGroupMemberUncheckedUpdateManyWithoutInvestorNestedInput = {
    create?: XOR<InvestorGroupMemberCreateWithoutInvestorInput, InvestorGroupMemberUncheckedCreateWithoutInvestorInput> | InvestorGroupMemberCreateWithoutInvestorInput[] | InvestorGroupMemberUncheckedCreateWithoutInvestorInput[]
    connectOrCreate?: InvestorGroupMemberCreateOrConnectWithoutInvestorInput | InvestorGroupMemberCreateOrConnectWithoutInvestorInput[]
    upsert?: InvestorGroupMemberUpsertWithWhereUniqueWithoutInvestorInput | InvestorGroupMemberUpsertWithWhereUniqueWithoutInvestorInput[]
    createMany?: InvestorGroupMemberCreateManyInvestorInputEnvelope
    set?: InvestorGroupMemberWhereUniqueInput | InvestorGroupMemberWhereUniqueInput[]
    disconnect?: InvestorGroupMemberWhereUniqueInput | InvestorGroupMemberWhereUniqueInput[]
    delete?: InvestorGroupMemberWhereUniqueInput | InvestorGroupMemberWhereUniqueInput[]
    connect?: InvestorGroupMemberWhereUniqueInput | InvestorGroupMemberWhereUniqueInput[]
    update?: InvestorGroupMemberUpdateWithWhereUniqueWithoutInvestorInput | InvestorGroupMemberUpdateWithWhereUniqueWithoutInvestorInput[]
    updateMany?: InvestorGroupMemberUpdateManyWithWhereWithoutInvestorInput | InvestorGroupMemberUpdateManyWithWhereWithoutInvestorInput[]
    deleteMany?: InvestorGroupMemberScalarWhereInput | InvestorGroupMemberScalarWhereInput[]
  }

  export type PFTrancheInvestorUncheckedUpdateManyWithoutInvestorNestedInput = {
    create?: XOR<PFTrancheInvestorCreateWithoutInvestorInput, PFTrancheInvestorUncheckedCreateWithoutInvestorInput> | PFTrancheInvestorCreateWithoutInvestorInput[] | PFTrancheInvestorUncheckedCreateWithoutInvestorInput[]
    connectOrCreate?: PFTrancheInvestorCreateOrConnectWithoutInvestorInput | PFTrancheInvestorCreateOrConnectWithoutInvestorInput[]
    upsert?: PFTrancheInvestorUpsertWithWhereUniqueWithoutInvestorInput | PFTrancheInvestorUpsertWithWhereUniqueWithoutInvestorInput[]
    createMany?: PFTrancheInvestorCreateManyInvestorInputEnvelope
    set?: PFTrancheInvestorWhereUniqueInput | PFTrancheInvestorWhereUniqueInput[]
    disconnect?: PFTrancheInvestorWhereUniqueInput | PFTrancheInvestorWhereUniqueInput[]
    delete?: PFTrancheInvestorWhereUniqueInput | PFTrancheInvestorWhereUniqueInput[]
    connect?: PFTrancheInvestorWhereUniqueInput | PFTrancheInvestorWhereUniqueInput[]
    update?: PFTrancheInvestorUpdateWithWhereUniqueWithoutInvestorInput | PFTrancheInvestorUpdateWithWhereUniqueWithoutInvestorInput[]
    updateMany?: PFTrancheInvestorUpdateManyWithWhereWithoutInvestorInput | PFTrancheInvestorUpdateManyWithWhereWithoutInvestorInput[]
    deleteMany?: PFTrancheInvestorScalarWhereInput | PFTrancheInvestorScalarWhereInput[]
  }

  export type InvestorGroupMemberCreateNestedManyWithoutGroupInput = {
    create?: XOR<InvestorGroupMemberCreateWithoutGroupInput, InvestorGroupMemberUncheckedCreateWithoutGroupInput> | InvestorGroupMemberCreateWithoutGroupInput[] | InvestorGroupMemberUncheckedCreateWithoutGroupInput[]
    connectOrCreate?: InvestorGroupMemberCreateOrConnectWithoutGroupInput | InvestorGroupMemberCreateOrConnectWithoutGroupInput[]
    createMany?: InvestorGroupMemberCreateManyGroupInputEnvelope
    connect?: InvestorGroupMemberWhereUniqueInput | InvestorGroupMemberWhereUniqueInput[]
  }

  export type InvestorGroupMemberUncheckedCreateNestedManyWithoutGroupInput = {
    create?: XOR<InvestorGroupMemberCreateWithoutGroupInput, InvestorGroupMemberUncheckedCreateWithoutGroupInput> | InvestorGroupMemberCreateWithoutGroupInput[] | InvestorGroupMemberUncheckedCreateWithoutGroupInput[]
    connectOrCreate?: InvestorGroupMemberCreateOrConnectWithoutGroupInput | InvestorGroupMemberCreateOrConnectWithoutGroupInput[]
    createMany?: InvestorGroupMemberCreateManyGroupInputEnvelope
    connect?: InvestorGroupMemberWhereUniqueInput | InvestorGroupMemberWhereUniqueInput[]
  }

  export type EnumInvestorGroupTypeFieldUpdateOperationsInput = {
    set?: $Enums.InvestorGroupType
  }

  export type EnumInvestorGroupStatusFieldUpdateOperationsInput = {
    set?: $Enums.InvestorGroupStatus
  }

  export type InvestorGroupMemberUpdateManyWithoutGroupNestedInput = {
    create?: XOR<InvestorGroupMemberCreateWithoutGroupInput, InvestorGroupMemberUncheckedCreateWithoutGroupInput> | InvestorGroupMemberCreateWithoutGroupInput[] | InvestorGroupMemberUncheckedCreateWithoutGroupInput[]
    connectOrCreate?: InvestorGroupMemberCreateOrConnectWithoutGroupInput | InvestorGroupMemberCreateOrConnectWithoutGroupInput[]
    upsert?: InvestorGroupMemberUpsertWithWhereUniqueWithoutGroupInput | InvestorGroupMemberUpsertWithWhereUniqueWithoutGroupInput[]
    createMany?: InvestorGroupMemberCreateManyGroupInputEnvelope
    set?: InvestorGroupMemberWhereUniqueInput | InvestorGroupMemberWhereUniqueInput[]
    disconnect?: InvestorGroupMemberWhereUniqueInput | InvestorGroupMemberWhereUniqueInput[]
    delete?: InvestorGroupMemberWhereUniqueInput | InvestorGroupMemberWhereUniqueInput[]
    connect?: InvestorGroupMemberWhereUniqueInput | InvestorGroupMemberWhereUniqueInput[]
    update?: InvestorGroupMemberUpdateWithWhereUniqueWithoutGroupInput | InvestorGroupMemberUpdateWithWhereUniqueWithoutGroupInput[]
    updateMany?: InvestorGroupMemberUpdateManyWithWhereWithoutGroupInput | InvestorGroupMemberUpdateManyWithWhereWithoutGroupInput[]
    deleteMany?: InvestorGroupMemberScalarWhereInput | InvestorGroupMemberScalarWhereInput[]
  }

  export type InvestorGroupMemberUncheckedUpdateManyWithoutGroupNestedInput = {
    create?: XOR<InvestorGroupMemberCreateWithoutGroupInput, InvestorGroupMemberUncheckedCreateWithoutGroupInput> | InvestorGroupMemberCreateWithoutGroupInput[] | InvestorGroupMemberUncheckedCreateWithoutGroupInput[]
    connectOrCreate?: InvestorGroupMemberCreateOrConnectWithoutGroupInput | InvestorGroupMemberCreateOrConnectWithoutGroupInput[]
    upsert?: InvestorGroupMemberUpsertWithWhereUniqueWithoutGroupInput | InvestorGroupMemberUpsertWithWhereUniqueWithoutGroupInput[]
    createMany?: InvestorGroupMemberCreateManyGroupInputEnvelope
    set?: InvestorGroupMemberWhereUniqueInput | InvestorGroupMemberWhereUniqueInput[]
    disconnect?: InvestorGroupMemberWhereUniqueInput | InvestorGroupMemberWhereUniqueInput[]
    delete?: InvestorGroupMemberWhereUniqueInput | InvestorGroupMemberWhereUniqueInput[]
    connect?: InvestorGroupMemberWhereUniqueInput | InvestorGroupMemberWhereUniqueInput[]
    update?: InvestorGroupMemberUpdateWithWhereUniqueWithoutGroupInput | InvestorGroupMemberUpdateWithWhereUniqueWithoutGroupInput[]
    updateMany?: InvestorGroupMemberUpdateManyWithWhereWithoutGroupInput | InvestorGroupMemberUpdateManyWithWhereWithoutGroupInput[]
    deleteMany?: InvestorGroupMemberScalarWhereInput | InvestorGroupMemberScalarWhereInput[]
  }

  export type InvestorGroupCreateNestedOneWithoutMembersInput = {
    create?: XOR<InvestorGroupCreateWithoutMembersInput, InvestorGroupUncheckedCreateWithoutMembersInput>
    connectOrCreate?: InvestorGroupCreateOrConnectWithoutMembersInput
    connect?: InvestorGroupWhereUniqueInput
  }

  export type InvestorCreateNestedOneWithoutGroupMembershipsInput = {
    create?: XOR<InvestorCreateWithoutGroupMembershipsInput, InvestorUncheckedCreateWithoutGroupMembershipsInput>
    connectOrCreate?: InvestorCreateOrConnectWithoutGroupMembershipsInput
    connect?: InvestorWhereUniqueInput
  }

  export type InvestorGroupUpdateOneRequiredWithoutMembersNestedInput = {
    create?: XOR<InvestorGroupCreateWithoutMembersInput, InvestorGroupUncheckedCreateWithoutMembersInput>
    connectOrCreate?: InvestorGroupCreateOrConnectWithoutMembersInput
    upsert?: InvestorGroupUpsertWithoutMembersInput
    connect?: InvestorGroupWhereUniqueInput
    update?: XOR<XOR<InvestorGroupUpdateToOneWithWhereWithoutMembersInput, InvestorGroupUpdateWithoutMembersInput>, InvestorGroupUncheckedUpdateWithoutMembersInput>
  }

  export type InvestorUpdateOneRequiredWithoutGroupMembershipsNestedInput = {
    create?: XOR<InvestorCreateWithoutGroupMembershipsInput, InvestorUncheckedCreateWithoutGroupMembershipsInput>
    connectOrCreate?: InvestorCreateOrConnectWithoutGroupMembershipsInput
    upsert?: InvestorUpsertWithoutGroupMembershipsInput
    connect?: InvestorWhereUniqueInput
    update?: XOR<XOR<InvestorUpdateToOneWithWhereWithoutGroupMembershipsInput, InvestorUpdateWithoutGroupMembershipsInput>, InvestorUncheckedUpdateWithoutGroupMembershipsInput>
  }

  export type SPCCreateNestedManyWithoutProjectInput = {
    create?: XOR<SPCCreateWithoutProjectInput, SPCUncheckedCreateWithoutProjectInput> | SPCCreateWithoutProjectInput[] | SPCUncheckedCreateWithoutProjectInput[]
    connectOrCreate?: SPCCreateOrConnectWithoutProjectInput | SPCCreateOrConnectWithoutProjectInput[]
    createMany?: SPCCreateManyProjectInputEnvelope
    connect?: SPCWhereUniqueInput | SPCWhereUniqueInput[]
  }

  export type SPCUncheckedCreateNestedManyWithoutProjectInput = {
    create?: XOR<SPCCreateWithoutProjectInput, SPCUncheckedCreateWithoutProjectInput> | SPCCreateWithoutProjectInput[] | SPCUncheckedCreateWithoutProjectInput[]
    connectOrCreate?: SPCCreateOrConnectWithoutProjectInput | SPCCreateOrConnectWithoutProjectInput[]
    createMany?: SPCCreateManyProjectInputEnvelope
    connect?: SPCWhereUniqueInput | SPCWhereUniqueInput[]
  }

  export type EnumProjectStatusFieldUpdateOperationsInput = {
    set?: $Enums.ProjectStatus
  }

  export type SPCUpdateManyWithoutProjectNestedInput = {
    create?: XOR<SPCCreateWithoutProjectInput, SPCUncheckedCreateWithoutProjectInput> | SPCCreateWithoutProjectInput[] | SPCUncheckedCreateWithoutProjectInput[]
    connectOrCreate?: SPCCreateOrConnectWithoutProjectInput | SPCCreateOrConnectWithoutProjectInput[]
    upsert?: SPCUpsertWithWhereUniqueWithoutProjectInput | SPCUpsertWithWhereUniqueWithoutProjectInput[]
    createMany?: SPCCreateManyProjectInputEnvelope
    set?: SPCWhereUniqueInput | SPCWhereUniqueInput[]
    disconnect?: SPCWhereUniqueInput | SPCWhereUniqueInput[]
    delete?: SPCWhereUniqueInput | SPCWhereUniqueInput[]
    connect?: SPCWhereUniqueInput | SPCWhereUniqueInput[]
    update?: SPCUpdateWithWhereUniqueWithoutProjectInput | SPCUpdateWithWhereUniqueWithoutProjectInput[]
    updateMany?: SPCUpdateManyWithWhereWithoutProjectInput | SPCUpdateManyWithWhereWithoutProjectInput[]
    deleteMany?: SPCScalarWhereInput | SPCScalarWhereInput[]
  }

  export type SPCUncheckedUpdateManyWithoutProjectNestedInput = {
    create?: XOR<SPCCreateWithoutProjectInput, SPCUncheckedCreateWithoutProjectInput> | SPCCreateWithoutProjectInput[] | SPCUncheckedCreateWithoutProjectInput[]
    connectOrCreate?: SPCCreateOrConnectWithoutProjectInput | SPCCreateOrConnectWithoutProjectInput[]
    upsert?: SPCUpsertWithWhereUniqueWithoutProjectInput | SPCUpsertWithWhereUniqueWithoutProjectInput[]
    createMany?: SPCCreateManyProjectInputEnvelope
    set?: SPCWhereUniqueInput | SPCWhereUniqueInput[]
    disconnect?: SPCWhereUniqueInput | SPCWhereUniqueInput[]
    delete?: SPCWhereUniqueInput | SPCWhereUniqueInput[]
    connect?: SPCWhereUniqueInput | SPCWhereUniqueInput[]
    update?: SPCUpdateWithWhereUniqueWithoutProjectInput | SPCUpdateWithWhereUniqueWithoutProjectInput[]
    updateMany?: SPCUpdateManyWithWhereWithoutProjectInput | SPCUpdateManyWithWhereWithoutProjectInput[]
    deleteMany?: SPCScalarWhereInput | SPCScalarWhereInput[]
  }

  export type FilmProjectCreateNestedOneWithoutSpcsInput = {
    create?: XOR<FilmProjectCreateWithoutSpcsInput, FilmProjectUncheckedCreateWithoutSpcsInput>
    connectOrCreate?: FilmProjectCreateOrConnectWithoutSpcsInput
    connect?: FilmProjectWhereUniqueInput
  }

  export type PFTrancheCreateNestedManyWithoutSpcInput = {
    create?: XOR<PFTrancheCreateWithoutSpcInput, PFTrancheUncheckedCreateWithoutSpcInput> | PFTrancheCreateWithoutSpcInput[] | PFTrancheUncheckedCreateWithoutSpcInput[]
    connectOrCreate?: PFTrancheCreateOrConnectWithoutSpcInput | PFTrancheCreateOrConnectWithoutSpcInput[]
    createMany?: PFTrancheCreateManySpcInputEnvelope
    connect?: PFTrancheWhereUniqueInput | PFTrancheWhereUniqueInput[]
  }

  export type WaterfallTierCreateNestedManyWithoutSpcInput = {
    create?: XOR<WaterfallTierCreateWithoutSpcInput, WaterfallTierUncheckedCreateWithoutSpcInput> | WaterfallTierCreateWithoutSpcInput[] | WaterfallTierUncheckedCreateWithoutSpcInput[]
    connectOrCreate?: WaterfallTierCreateOrConnectWithoutSpcInput | WaterfallTierCreateOrConnectWithoutSpcInput[]
    createMany?: WaterfallTierCreateManySpcInputEnvelope
    connect?: WaterfallTierWhereUniqueInput | WaterfallTierWhereUniqueInput[]
  }

  export type RevenueEventCreateNestedManyWithoutSpcInput = {
    create?: XOR<RevenueEventCreateWithoutSpcInput, RevenueEventUncheckedCreateWithoutSpcInput> | RevenueEventCreateWithoutSpcInput[] | RevenueEventUncheckedCreateWithoutSpcInput[]
    connectOrCreate?: RevenueEventCreateOrConnectWithoutSpcInput | RevenueEventCreateOrConnectWithoutSpcInput[]
    createMany?: RevenueEventCreateManySpcInputEnvelope
    connect?: RevenueEventWhereUniqueInput | RevenueEventWhereUniqueInput[]
  }

  export type PFTrancheUncheckedCreateNestedManyWithoutSpcInput = {
    create?: XOR<PFTrancheCreateWithoutSpcInput, PFTrancheUncheckedCreateWithoutSpcInput> | PFTrancheCreateWithoutSpcInput[] | PFTrancheUncheckedCreateWithoutSpcInput[]
    connectOrCreate?: PFTrancheCreateOrConnectWithoutSpcInput | PFTrancheCreateOrConnectWithoutSpcInput[]
    createMany?: PFTrancheCreateManySpcInputEnvelope
    connect?: PFTrancheWhereUniqueInput | PFTrancheWhereUniqueInput[]
  }

  export type WaterfallTierUncheckedCreateNestedManyWithoutSpcInput = {
    create?: XOR<WaterfallTierCreateWithoutSpcInput, WaterfallTierUncheckedCreateWithoutSpcInput> | WaterfallTierCreateWithoutSpcInput[] | WaterfallTierUncheckedCreateWithoutSpcInput[]
    connectOrCreate?: WaterfallTierCreateOrConnectWithoutSpcInput | WaterfallTierCreateOrConnectWithoutSpcInput[]
    createMany?: WaterfallTierCreateManySpcInputEnvelope
    connect?: WaterfallTierWhereUniqueInput | WaterfallTierWhereUniqueInput[]
  }

  export type RevenueEventUncheckedCreateNestedManyWithoutSpcInput = {
    create?: XOR<RevenueEventCreateWithoutSpcInput, RevenueEventUncheckedCreateWithoutSpcInput> | RevenueEventCreateWithoutSpcInput[] | RevenueEventUncheckedCreateWithoutSpcInput[]
    connectOrCreate?: RevenueEventCreateOrConnectWithoutSpcInput | RevenueEventCreateOrConnectWithoutSpcInput[]
    createMany?: RevenueEventCreateManySpcInputEnvelope
    connect?: RevenueEventWhereUniqueInput | RevenueEventWhereUniqueInput[]
  }

  export type EnumSPCLegalTypeFieldUpdateOperationsInput = {
    set?: $Enums.SPCLegalType
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type EnumSPCStatusFieldUpdateOperationsInput = {
    set?: $Enums.SPCStatus
  }

  export type FilmProjectUpdateOneRequiredWithoutSpcsNestedInput = {
    create?: XOR<FilmProjectCreateWithoutSpcsInput, FilmProjectUncheckedCreateWithoutSpcsInput>
    connectOrCreate?: FilmProjectCreateOrConnectWithoutSpcsInput
    upsert?: FilmProjectUpsertWithoutSpcsInput
    connect?: FilmProjectWhereUniqueInput
    update?: XOR<XOR<FilmProjectUpdateToOneWithWhereWithoutSpcsInput, FilmProjectUpdateWithoutSpcsInput>, FilmProjectUncheckedUpdateWithoutSpcsInput>
  }

  export type PFTrancheUpdateManyWithoutSpcNestedInput = {
    create?: XOR<PFTrancheCreateWithoutSpcInput, PFTrancheUncheckedCreateWithoutSpcInput> | PFTrancheCreateWithoutSpcInput[] | PFTrancheUncheckedCreateWithoutSpcInput[]
    connectOrCreate?: PFTrancheCreateOrConnectWithoutSpcInput | PFTrancheCreateOrConnectWithoutSpcInput[]
    upsert?: PFTrancheUpsertWithWhereUniqueWithoutSpcInput | PFTrancheUpsertWithWhereUniqueWithoutSpcInput[]
    createMany?: PFTrancheCreateManySpcInputEnvelope
    set?: PFTrancheWhereUniqueInput | PFTrancheWhereUniqueInput[]
    disconnect?: PFTrancheWhereUniqueInput | PFTrancheWhereUniqueInput[]
    delete?: PFTrancheWhereUniqueInput | PFTrancheWhereUniqueInput[]
    connect?: PFTrancheWhereUniqueInput | PFTrancheWhereUniqueInput[]
    update?: PFTrancheUpdateWithWhereUniqueWithoutSpcInput | PFTrancheUpdateWithWhereUniqueWithoutSpcInput[]
    updateMany?: PFTrancheUpdateManyWithWhereWithoutSpcInput | PFTrancheUpdateManyWithWhereWithoutSpcInput[]
    deleteMany?: PFTrancheScalarWhereInput | PFTrancheScalarWhereInput[]
  }

  export type WaterfallTierUpdateManyWithoutSpcNestedInput = {
    create?: XOR<WaterfallTierCreateWithoutSpcInput, WaterfallTierUncheckedCreateWithoutSpcInput> | WaterfallTierCreateWithoutSpcInput[] | WaterfallTierUncheckedCreateWithoutSpcInput[]
    connectOrCreate?: WaterfallTierCreateOrConnectWithoutSpcInput | WaterfallTierCreateOrConnectWithoutSpcInput[]
    upsert?: WaterfallTierUpsertWithWhereUniqueWithoutSpcInput | WaterfallTierUpsertWithWhereUniqueWithoutSpcInput[]
    createMany?: WaterfallTierCreateManySpcInputEnvelope
    set?: WaterfallTierWhereUniqueInput | WaterfallTierWhereUniqueInput[]
    disconnect?: WaterfallTierWhereUniqueInput | WaterfallTierWhereUniqueInput[]
    delete?: WaterfallTierWhereUniqueInput | WaterfallTierWhereUniqueInput[]
    connect?: WaterfallTierWhereUniqueInput | WaterfallTierWhereUniqueInput[]
    update?: WaterfallTierUpdateWithWhereUniqueWithoutSpcInput | WaterfallTierUpdateWithWhereUniqueWithoutSpcInput[]
    updateMany?: WaterfallTierUpdateManyWithWhereWithoutSpcInput | WaterfallTierUpdateManyWithWhereWithoutSpcInput[]
    deleteMany?: WaterfallTierScalarWhereInput | WaterfallTierScalarWhereInput[]
  }

  export type RevenueEventUpdateManyWithoutSpcNestedInput = {
    create?: XOR<RevenueEventCreateWithoutSpcInput, RevenueEventUncheckedCreateWithoutSpcInput> | RevenueEventCreateWithoutSpcInput[] | RevenueEventUncheckedCreateWithoutSpcInput[]
    connectOrCreate?: RevenueEventCreateOrConnectWithoutSpcInput | RevenueEventCreateOrConnectWithoutSpcInput[]
    upsert?: RevenueEventUpsertWithWhereUniqueWithoutSpcInput | RevenueEventUpsertWithWhereUniqueWithoutSpcInput[]
    createMany?: RevenueEventCreateManySpcInputEnvelope
    set?: RevenueEventWhereUniqueInput | RevenueEventWhereUniqueInput[]
    disconnect?: RevenueEventWhereUniqueInput | RevenueEventWhereUniqueInput[]
    delete?: RevenueEventWhereUniqueInput | RevenueEventWhereUniqueInput[]
    connect?: RevenueEventWhereUniqueInput | RevenueEventWhereUniqueInput[]
    update?: RevenueEventUpdateWithWhereUniqueWithoutSpcInput | RevenueEventUpdateWithWhereUniqueWithoutSpcInput[]
    updateMany?: RevenueEventUpdateManyWithWhereWithoutSpcInput | RevenueEventUpdateManyWithWhereWithoutSpcInput[]
    deleteMany?: RevenueEventScalarWhereInput | RevenueEventScalarWhereInput[]
  }

  export type PFTrancheUncheckedUpdateManyWithoutSpcNestedInput = {
    create?: XOR<PFTrancheCreateWithoutSpcInput, PFTrancheUncheckedCreateWithoutSpcInput> | PFTrancheCreateWithoutSpcInput[] | PFTrancheUncheckedCreateWithoutSpcInput[]
    connectOrCreate?: PFTrancheCreateOrConnectWithoutSpcInput | PFTrancheCreateOrConnectWithoutSpcInput[]
    upsert?: PFTrancheUpsertWithWhereUniqueWithoutSpcInput | PFTrancheUpsertWithWhereUniqueWithoutSpcInput[]
    createMany?: PFTrancheCreateManySpcInputEnvelope
    set?: PFTrancheWhereUniqueInput | PFTrancheWhereUniqueInput[]
    disconnect?: PFTrancheWhereUniqueInput | PFTrancheWhereUniqueInput[]
    delete?: PFTrancheWhereUniqueInput | PFTrancheWhereUniqueInput[]
    connect?: PFTrancheWhereUniqueInput | PFTrancheWhereUniqueInput[]
    update?: PFTrancheUpdateWithWhereUniqueWithoutSpcInput | PFTrancheUpdateWithWhereUniqueWithoutSpcInput[]
    updateMany?: PFTrancheUpdateManyWithWhereWithoutSpcInput | PFTrancheUpdateManyWithWhereWithoutSpcInput[]
    deleteMany?: PFTrancheScalarWhereInput | PFTrancheScalarWhereInput[]
  }

  export type WaterfallTierUncheckedUpdateManyWithoutSpcNestedInput = {
    create?: XOR<WaterfallTierCreateWithoutSpcInput, WaterfallTierUncheckedCreateWithoutSpcInput> | WaterfallTierCreateWithoutSpcInput[] | WaterfallTierUncheckedCreateWithoutSpcInput[]
    connectOrCreate?: WaterfallTierCreateOrConnectWithoutSpcInput | WaterfallTierCreateOrConnectWithoutSpcInput[]
    upsert?: WaterfallTierUpsertWithWhereUniqueWithoutSpcInput | WaterfallTierUpsertWithWhereUniqueWithoutSpcInput[]
    createMany?: WaterfallTierCreateManySpcInputEnvelope
    set?: WaterfallTierWhereUniqueInput | WaterfallTierWhereUniqueInput[]
    disconnect?: WaterfallTierWhereUniqueInput | WaterfallTierWhereUniqueInput[]
    delete?: WaterfallTierWhereUniqueInput | WaterfallTierWhereUniqueInput[]
    connect?: WaterfallTierWhereUniqueInput | WaterfallTierWhereUniqueInput[]
    update?: WaterfallTierUpdateWithWhereUniqueWithoutSpcInput | WaterfallTierUpdateWithWhereUniqueWithoutSpcInput[]
    updateMany?: WaterfallTierUpdateManyWithWhereWithoutSpcInput | WaterfallTierUpdateManyWithWhereWithoutSpcInput[]
    deleteMany?: WaterfallTierScalarWhereInput | WaterfallTierScalarWhereInput[]
  }

  export type RevenueEventUncheckedUpdateManyWithoutSpcNestedInput = {
    create?: XOR<RevenueEventCreateWithoutSpcInput, RevenueEventUncheckedCreateWithoutSpcInput> | RevenueEventCreateWithoutSpcInput[] | RevenueEventUncheckedCreateWithoutSpcInput[]
    connectOrCreate?: RevenueEventCreateOrConnectWithoutSpcInput | RevenueEventCreateOrConnectWithoutSpcInput[]
    upsert?: RevenueEventUpsertWithWhereUniqueWithoutSpcInput | RevenueEventUpsertWithWhereUniqueWithoutSpcInput[]
    createMany?: RevenueEventCreateManySpcInputEnvelope
    set?: RevenueEventWhereUniqueInput | RevenueEventWhereUniqueInput[]
    disconnect?: RevenueEventWhereUniqueInput | RevenueEventWhereUniqueInput[]
    delete?: RevenueEventWhereUniqueInput | RevenueEventWhereUniqueInput[]
    connect?: RevenueEventWhereUniqueInput | RevenueEventWhereUniqueInput[]
    update?: RevenueEventUpdateWithWhereUniqueWithoutSpcInput | RevenueEventUpdateWithWhereUniqueWithoutSpcInput[]
    updateMany?: RevenueEventUpdateManyWithWhereWithoutSpcInput | RevenueEventUpdateManyWithWhereWithoutSpcInput[]
    deleteMany?: RevenueEventScalarWhereInput | RevenueEventScalarWhereInput[]
  }

  export type SPCCreateNestedOneWithoutTranchesInput = {
    create?: XOR<SPCCreateWithoutTranchesInput, SPCUncheckedCreateWithoutTranchesInput>
    connectOrCreate?: SPCCreateOrConnectWithoutTranchesInput
    connect?: SPCWhereUniqueInput
  }

  export type PFTrancheInvestorCreateNestedManyWithoutTrancheInput = {
    create?: XOR<PFTrancheInvestorCreateWithoutTrancheInput, PFTrancheInvestorUncheckedCreateWithoutTrancheInput> | PFTrancheInvestorCreateWithoutTrancheInput[] | PFTrancheInvestorUncheckedCreateWithoutTrancheInput[]
    connectOrCreate?: PFTrancheInvestorCreateOrConnectWithoutTrancheInput | PFTrancheInvestorCreateOrConnectWithoutTrancheInput[]
    createMany?: PFTrancheInvestorCreateManyTrancheInputEnvelope
    connect?: PFTrancheInvestorWhereUniqueInput | PFTrancheInvestorWhereUniqueInput[]
  }

  export type WaterfallTierCreateNestedManyWithoutTrancheInput = {
    create?: XOR<WaterfallTierCreateWithoutTrancheInput, WaterfallTierUncheckedCreateWithoutTrancheInput> | WaterfallTierCreateWithoutTrancheInput[] | WaterfallTierUncheckedCreateWithoutTrancheInput[]
    connectOrCreate?: WaterfallTierCreateOrConnectWithoutTrancheInput | WaterfallTierCreateOrConnectWithoutTrancheInput[]
    createMany?: WaterfallTierCreateManyTrancheInputEnvelope
    connect?: WaterfallTierWhereUniqueInput | WaterfallTierWhereUniqueInput[]
  }

  export type PFTrancheInvestorUncheckedCreateNestedManyWithoutTrancheInput = {
    create?: XOR<PFTrancheInvestorCreateWithoutTrancheInput, PFTrancheInvestorUncheckedCreateWithoutTrancheInput> | PFTrancheInvestorCreateWithoutTrancheInput[] | PFTrancheInvestorUncheckedCreateWithoutTrancheInput[]
    connectOrCreate?: PFTrancheInvestorCreateOrConnectWithoutTrancheInput | PFTrancheInvestorCreateOrConnectWithoutTrancheInput[]
    createMany?: PFTrancheInvestorCreateManyTrancheInputEnvelope
    connect?: PFTrancheInvestorWhereUniqueInput | PFTrancheInvestorWhereUniqueInput[]
  }

  export type WaterfallTierUncheckedCreateNestedManyWithoutTrancheInput = {
    create?: XOR<WaterfallTierCreateWithoutTrancheInput, WaterfallTierUncheckedCreateWithoutTrancheInput> | WaterfallTierCreateWithoutTrancheInput[] | WaterfallTierUncheckedCreateWithoutTrancheInput[]
    connectOrCreate?: WaterfallTierCreateOrConnectWithoutTrancheInput | WaterfallTierCreateOrConnectWithoutTrancheInput[]
    createMany?: WaterfallTierCreateManyTrancheInputEnvelope
    connect?: WaterfallTierWhereUniqueInput | WaterfallTierWhereUniqueInput[]
  }

  export type EnumTrancheTypeFieldUpdateOperationsInput = {
    set?: $Enums.TrancheType
  }

  export type NullableFloatFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type EnumTrancheStatusFieldUpdateOperationsInput = {
    set?: $Enums.TrancheStatus
  }

  export type SPCUpdateOneRequiredWithoutTranchesNestedInput = {
    create?: XOR<SPCCreateWithoutTranchesInput, SPCUncheckedCreateWithoutTranchesInput>
    connectOrCreate?: SPCCreateOrConnectWithoutTranchesInput
    upsert?: SPCUpsertWithoutTranchesInput
    connect?: SPCWhereUniqueInput
    update?: XOR<XOR<SPCUpdateToOneWithWhereWithoutTranchesInput, SPCUpdateWithoutTranchesInput>, SPCUncheckedUpdateWithoutTranchesInput>
  }

  export type PFTrancheInvestorUpdateManyWithoutTrancheNestedInput = {
    create?: XOR<PFTrancheInvestorCreateWithoutTrancheInput, PFTrancheInvestorUncheckedCreateWithoutTrancheInput> | PFTrancheInvestorCreateWithoutTrancheInput[] | PFTrancheInvestorUncheckedCreateWithoutTrancheInput[]
    connectOrCreate?: PFTrancheInvestorCreateOrConnectWithoutTrancheInput | PFTrancheInvestorCreateOrConnectWithoutTrancheInput[]
    upsert?: PFTrancheInvestorUpsertWithWhereUniqueWithoutTrancheInput | PFTrancheInvestorUpsertWithWhereUniqueWithoutTrancheInput[]
    createMany?: PFTrancheInvestorCreateManyTrancheInputEnvelope
    set?: PFTrancheInvestorWhereUniqueInput | PFTrancheInvestorWhereUniqueInput[]
    disconnect?: PFTrancheInvestorWhereUniqueInput | PFTrancheInvestorWhereUniqueInput[]
    delete?: PFTrancheInvestorWhereUniqueInput | PFTrancheInvestorWhereUniqueInput[]
    connect?: PFTrancheInvestorWhereUniqueInput | PFTrancheInvestorWhereUniqueInput[]
    update?: PFTrancheInvestorUpdateWithWhereUniqueWithoutTrancheInput | PFTrancheInvestorUpdateWithWhereUniqueWithoutTrancheInput[]
    updateMany?: PFTrancheInvestorUpdateManyWithWhereWithoutTrancheInput | PFTrancheInvestorUpdateManyWithWhereWithoutTrancheInput[]
    deleteMany?: PFTrancheInvestorScalarWhereInput | PFTrancheInvestorScalarWhereInput[]
  }

  export type WaterfallTierUpdateManyWithoutTrancheNestedInput = {
    create?: XOR<WaterfallTierCreateWithoutTrancheInput, WaterfallTierUncheckedCreateWithoutTrancheInput> | WaterfallTierCreateWithoutTrancheInput[] | WaterfallTierUncheckedCreateWithoutTrancheInput[]
    connectOrCreate?: WaterfallTierCreateOrConnectWithoutTrancheInput | WaterfallTierCreateOrConnectWithoutTrancheInput[]
    upsert?: WaterfallTierUpsertWithWhereUniqueWithoutTrancheInput | WaterfallTierUpsertWithWhereUniqueWithoutTrancheInput[]
    createMany?: WaterfallTierCreateManyTrancheInputEnvelope
    set?: WaterfallTierWhereUniqueInput | WaterfallTierWhereUniqueInput[]
    disconnect?: WaterfallTierWhereUniqueInput | WaterfallTierWhereUniqueInput[]
    delete?: WaterfallTierWhereUniqueInput | WaterfallTierWhereUniqueInput[]
    connect?: WaterfallTierWhereUniqueInput | WaterfallTierWhereUniqueInput[]
    update?: WaterfallTierUpdateWithWhereUniqueWithoutTrancheInput | WaterfallTierUpdateWithWhereUniqueWithoutTrancheInput[]
    updateMany?: WaterfallTierUpdateManyWithWhereWithoutTrancheInput | WaterfallTierUpdateManyWithWhereWithoutTrancheInput[]
    deleteMany?: WaterfallTierScalarWhereInput | WaterfallTierScalarWhereInput[]
  }

  export type PFTrancheInvestorUncheckedUpdateManyWithoutTrancheNestedInput = {
    create?: XOR<PFTrancheInvestorCreateWithoutTrancheInput, PFTrancheInvestorUncheckedCreateWithoutTrancheInput> | PFTrancheInvestorCreateWithoutTrancheInput[] | PFTrancheInvestorUncheckedCreateWithoutTrancheInput[]
    connectOrCreate?: PFTrancheInvestorCreateOrConnectWithoutTrancheInput | PFTrancheInvestorCreateOrConnectWithoutTrancheInput[]
    upsert?: PFTrancheInvestorUpsertWithWhereUniqueWithoutTrancheInput | PFTrancheInvestorUpsertWithWhereUniqueWithoutTrancheInput[]
    createMany?: PFTrancheInvestorCreateManyTrancheInputEnvelope
    set?: PFTrancheInvestorWhereUniqueInput | PFTrancheInvestorWhereUniqueInput[]
    disconnect?: PFTrancheInvestorWhereUniqueInput | PFTrancheInvestorWhereUniqueInput[]
    delete?: PFTrancheInvestorWhereUniqueInput | PFTrancheInvestorWhereUniqueInput[]
    connect?: PFTrancheInvestorWhereUniqueInput | PFTrancheInvestorWhereUniqueInput[]
    update?: PFTrancheInvestorUpdateWithWhereUniqueWithoutTrancheInput | PFTrancheInvestorUpdateWithWhereUniqueWithoutTrancheInput[]
    updateMany?: PFTrancheInvestorUpdateManyWithWhereWithoutTrancheInput | PFTrancheInvestorUpdateManyWithWhereWithoutTrancheInput[]
    deleteMany?: PFTrancheInvestorScalarWhereInput | PFTrancheInvestorScalarWhereInput[]
  }

  export type WaterfallTierUncheckedUpdateManyWithoutTrancheNestedInput = {
    create?: XOR<WaterfallTierCreateWithoutTrancheInput, WaterfallTierUncheckedCreateWithoutTrancheInput> | WaterfallTierCreateWithoutTrancheInput[] | WaterfallTierUncheckedCreateWithoutTrancheInput[]
    connectOrCreate?: WaterfallTierCreateOrConnectWithoutTrancheInput | WaterfallTierCreateOrConnectWithoutTrancheInput[]
    upsert?: WaterfallTierUpsertWithWhereUniqueWithoutTrancheInput | WaterfallTierUpsertWithWhereUniqueWithoutTrancheInput[]
    createMany?: WaterfallTierCreateManyTrancheInputEnvelope
    set?: WaterfallTierWhereUniqueInput | WaterfallTierWhereUniqueInput[]
    disconnect?: WaterfallTierWhereUniqueInput | WaterfallTierWhereUniqueInput[]
    delete?: WaterfallTierWhereUniqueInput | WaterfallTierWhereUniqueInput[]
    connect?: WaterfallTierWhereUniqueInput | WaterfallTierWhereUniqueInput[]
    update?: WaterfallTierUpdateWithWhereUniqueWithoutTrancheInput | WaterfallTierUpdateWithWhereUniqueWithoutTrancheInput[]
    updateMany?: WaterfallTierUpdateManyWithWhereWithoutTrancheInput | WaterfallTierUpdateManyWithWhereWithoutTrancheInput[]
    deleteMany?: WaterfallTierScalarWhereInput | WaterfallTierScalarWhereInput[]
  }

  export type PFTrancheCreateNestedOneWithoutInvestorsInput = {
    create?: XOR<PFTrancheCreateWithoutInvestorsInput, PFTrancheUncheckedCreateWithoutInvestorsInput>
    connectOrCreate?: PFTrancheCreateOrConnectWithoutInvestorsInput
    connect?: PFTrancheWhereUniqueInput
  }

  export type InvestorCreateNestedOneWithoutTranchePositionsInput = {
    create?: XOR<InvestorCreateWithoutTranchePositionsInput, InvestorUncheckedCreateWithoutTranchePositionsInput>
    connectOrCreate?: InvestorCreateOrConnectWithoutTranchePositionsInput
    connect?: InvestorWhereUniqueInput
  }

  export type PFTrancheUpdateOneRequiredWithoutInvestorsNestedInput = {
    create?: XOR<PFTrancheCreateWithoutInvestorsInput, PFTrancheUncheckedCreateWithoutInvestorsInput>
    connectOrCreate?: PFTrancheCreateOrConnectWithoutInvestorsInput
    upsert?: PFTrancheUpsertWithoutInvestorsInput
    connect?: PFTrancheWhereUniqueInput
    update?: XOR<XOR<PFTrancheUpdateToOneWithWhereWithoutInvestorsInput, PFTrancheUpdateWithoutInvestorsInput>, PFTrancheUncheckedUpdateWithoutInvestorsInput>
  }

  export type InvestorUpdateOneRequiredWithoutTranchePositionsNestedInput = {
    create?: XOR<InvestorCreateWithoutTranchePositionsInput, InvestorUncheckedCreateWithoutTranchePositionsInput>
    connectOrCreate?: InvestorCreateOrConnectWithoutTranchePositionsInput
    upsert?: InvestorUpsertWithoutTranchePositionsInput
    connect?: InvestorWhereUniqueInput
    update?: XOR<XOR<InvestorUpdateToOneWithWhereWithoutTranchePositionsInput, InvestorUpdateWithoutTranchePositionsInput>, InvestorUncheckedUpdateWithoutTranchePositionsInput>
  }

  export type SPCCreateNestedOneWithoutWaterfallTiersInput = {
    create?: XOR<SPCCreateWithoutWaterfallTiersInput, SPCUncheckedCreateWithoutWaterfallTiersInput>
    connectOrCreate?: SPCCreateOrConnectWithoutWaterfallTiersInput
    connect?: SPCWhereUniqueInput
  }

  export type PFTrancheCreateNestedOneWithoutWaterfallTiersInput = {
    create?: XOR<PFTrancheCreateWithoutWaterfallTiersInput, PFTrancheUncheckedCreateWithoutWaterfallTiersInput>
    connectOrCreate?: PFTrancheCreateOrConnectWithoutWaterfallTiersInput
    connect?: PFTrancheWhereUniqueInput
  }

  export type EnumTierTypeFieldUpdateOperationsInput = {
    set?: $Enums.TierType
  }

  export type SPCUpdateOneRequiredWithoutWaterfallTiersNestedInput = {
    create?: XOR<SPCCreateWithoutWaterfallTiersInput, SPCUncheckedCreateWithoutWaterfallTiersInput>
    connectOrCreate?: SPCCreateOrConnectWithoutWaterfallTiersInput
    upsert?: SPCUpsertWithoutWaterfallTiersInput
    connect?: SPCWhereUniqueInput
    update?: XOR<XOR<SPCUpdateToOneWithWhereWithoutWaterfallTiersInput, SPCUpdateWithoutWaterfallTiersInput>, SPCUncheckedUpdateWithoutWaterfallTiersInput>
  }

  export type PFTrancheUpdateOneWithoutWaterfallTiersNestedInput = {
    create?: XOR<PFTrancheCreateWithoutWaterfallTiersInput, PFTrancheUncheckedCreateWithoutWaterfallTiersInput>
    connectOrCreate?: PFTrancheCreateOrConnectWithoutWaterfallTiersInput
    upsert?: PFTrancheUpsertWithoutWaterfallTiersInput
    disconnect?: PFTrancheWhereInput | boolean
    delete?: PFTrancheWhereInput | boolean
    connect?: PFTrancheWhereUniqueInput
    update?: XOR<XOR<PFTrancheUpdateToOneWithWhereWithoutWaterfallTiersInput, PFTrancheUpdateWithoutWaterfallTiersInput>, PFTrancheUncheckedUpdateWithoutWaterfallTiersInput>
  }

  export type SPCCreateNestedOneWithoutRevenueEventsInput = {
    create?: XOR<SPCCreateWithoutRevenueEventsInput, SPCUncheckedCreateWithoutRevenueEventsInput>
    connectOrCreate?: SPCCreateOrConnectWithoutRevenueEventsInput
    connect?: SPCWhereUniqueInput
  }

  export type WaterfallDistributionCreateNestedManyWithoutEventInput = {
    create?: XOR<WaterfallDistributionCreateWithoutEventInput, WaterfallDistributionUncheckedCreateWithoutEventInput> | WaterfallDistributionCreateWithoutEventInput[] | WaterfallDistributionUncheckedCreateWithoutEventInput[]
    connectOrCreate?: WaterfallDistributionCreateOrConnectWithoutEventInput | WaterfallDistributionCreateOrConnectWithoutEventInput[]
    createMany?: WaterfallDistributionCreateManyEventInputEnvelope
    connect?: WaterfallDistributionWhereUniqueInput | WaterfallDistributionWhereUniqueInput[]
  }

  export type WaterfallDistributionUncheckedCreateNestedManyWithoutEventInput = {
    create?: XOR<WaterfallDistributionCreateWithoutEventInput, WaterfallDistributionUncheckedCreateWithoutEventInput> | WaterfallDistributionCreateWithoutEventInput[] | WaterfallDistributionUncheckedCreateWithoutEventInput[]
    connectOrCreate?: WaterfallDistributionCreateOrConnectWithoutEventInput | WaterfallDistributionCreateOrConnectWithoutEventInput[]
    createMany?: WaterfallDistributionCreateManyEventInputEnvelope
    connect?: WaterfallDistributionWhereUniqueInput | WaterfallDistributionWhereUniqueInput[]
  }

  export type EnumRevenueSourceFieldUpdateOperationsInput = {
    set?: $Enums.RevenueSource
  }

  export type SPCUpdateOneRequiredWithoutRevenueEventsNestedInput = {
    create?: XOR<SPCCreateWithoutRevenueEventsInput, SPCUncheckedCreateWithoutRevenueEventsInput>
    connectOrCreate?: SPCCreateOrConnectWithoutRevenueEventsInput
    upsert?: SPCUpsertWithoutRevenueEventsInput
    connect?: SPCWhereUniqueInput
    update?: XOR<XOR<SPCUpdateToOneWithWhereWithoutRevenueEventsInput, SPCUpdateWithoutRevenueEventsInput>, SPCUncheckedUpdateWithoutRevenueEventsInput>
  }

  export type WaterfallDistributionUpdateManyWithoutEventNestedInput = {
    create?: XOR<WaterfallDistributionCreateWithoutEventInput, WaterfallDistributionUncheckedCreateWithoutEventInput> | WaterfallDistributionCreateWithoutEventInput[] | WaterfallDistributionUncheckedCreateWithoutEventInput[]
    connectOrCreate?: WaterfallDistributionCreateOrConnectWithoutEventInput | WaterfallDistributionCreateOrConnectWithoutEventInput[]
    upsert?: WaterfallDistributionUpsertWithWhereUniqueWithoutEventInput | WaterfallDistributionUpsertWithWhereUniqueWithoutEventInput[]
    createMany?: WaterfallDistributionCreateManyEventInputEnvelope
    set?: WaterfallDistributionWhereUniqueInput | WaterfallDistributionWhereUniqueInput[]
    disconnect?: WaterfallDistributionWhereUniqueInput | WaterfallDistributionWhereUniqueInput[]
    delete?: WaterfallDistributionWhereUniqueInput | WaterfallDistributionWhereUniqueInput[]
    connect?: WaterfallDistributionWhereUniqueInput | WaterfallDistributionWhereUniqueInput[]
    update?: WaterfallDistributionUpdateWithWhereUniqueWithoutEventInput | WaterfallDistributionUpdateWithWhereUniqueWithoutEventInput[]
    updateMany?: WaterfallDistributionUpdateManyWithWhereWithoutEventInput | WaterfallDistributionUpdateManyWithWhereWithoutEventInput[]
    deleteMany?: WaterfallDistributionScalarWhereInput | WaterfallDistributionScalarWhereInput[]
  }

  export type WaterfallDistributionUncheckedUpdateManyWithoutEventNestedInput = {
    create?: XOR<WaterfallDistributionCreateWithoutEventInput, WaterfallDistributionUncheckedCreateWithoutEventInput> | WaterfallDistributionCreateWithoutEventInput[] | WaterfallDistributionUncheckedCreateWithoutEventInput[]
    connectOrCreate?: WaterfallDistributionCreateOrConnectWithoutEventInput | WaterfallDistributionCreateOrConnectWithoutEventInput[]
    upsert?: WaterfallDistributionUpsertWithWhereUniqueWithoutEventInput | WaterfallDistributionUpsertWithWhereUniqueWithoutEventInput[]
    createMany?: WaterfallDistributionCreateManyEventInputEnvelope
    set?: WaterfallDistributionWhereUniqueInput | WaterfallDistributionWhereUniqueInput[]
    disconnect?: WaterfallDistributionWhereUniqueInput | WaterfallDistributionWhereUniqueInput[]
    delete?: WaterfallDistributionWhereUniqueInput | WaterfallDistributionWhereUniqueInput[]
    connect?: WaterfallDistributionWhereUniqueInput | WaterfallDistributionWhereUniqueInput[]
    update?: WaterfallDistributionUpdateWithWhereUniqueWithoutEventInput | WaterfallDistributionUpdateWithWhereUniqueWithoutEventInput[]
    updateMany?: WaterfallDistributionUpdateManyWithWhereWithoutEventInput | WaterfallDistributionUpdateManyWithWhereWithoutEventInput[]
    deleteMany?: WaterfallDistributionScalarWhereInput | WaterfallDistributionScalarWhereInput[]
  }

  export type RevenueEventCreateNestedOneWithoutDistributionsInput = {
    create?: XOR<RevenueEventCreateWithoutDistributionsInput, RevenueEventUncheckedCreateWithoutDistributionsInput>
    connectOrCreate?: RevenueEventCreateOrConnectWithoutDistributionsInput
    connect?: RevenueEventWhereUniqueInput
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type RevenueEventUpdateOneRequiredWithoutDistributionsNestedInput = {
    create?: XOR<RevenueEventCreateWithoutDistributionsInput, RevenueEventUncheckedCreateWithoutDistributionsInput>
    connectOrCreate?: RevenueEventCreateOrConnectWithoutDistributionsInput
    upsert?: RevenueEventUpsertWithoutDistributionsInput
    connect?: RevenueEventWhereUniqueInput
    update?: XOR<XOR<RevenueEventUpdateToOneWithWhereWithoutDistributionsInput, RevenueEventUpdateWithoutDistributionsInput>, RevenueEventUncheckedUpdateWithoutDistributionsInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedEnumInvestorTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.InvestorType | EnumInvestorTypeFieldRefInput<$PrismaModel>
    in?: $Enums.InvestorType[]
    notIn?: $Enums.InvestorType[]
    not?: NestedEnumInvestorTypeFilter<$PrismaModel> | $Enums.InvestorType
  }

  export type NestedEnumInvestorTierFilter<$PrismaModel = never> = {
    equals?: $Enums.InvestorTier | EnumInvestorTierFieldRefInput<$PrismaModel>
    in?: $Enums.InvestorTier[]
    notIn?: $Enums.InvestorTier[]
    not?: NestedEnumInvestorTierFilter<$PrismaModel> | $Enums.InvestorTier
  }

  export type NestedEnumInvestorStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.InvestorStatus | EnumInvestorStatusFieldRefInput<$PrismaModel>
    in?: $Enums.InvestorStatus[]
    notIn?: $Enums.InvestorStatus[]
    not?: NestedEnumInvestorStatusFilter<$PrismaModel> | $Enums.InvestorStatus
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedEnumInvestorTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.InvestorType | EnumInvestorTypeFieldRefInput<$PrismaModel>
    in?: $Enums.InvestorType[]
    notIn?: $Enums.InvestorType[]
    not?: NestedEnumInvestorTypeWithAggregatesFilter<$PrismaModel> | $Enums.InvestorType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumInvestorTypeFilter<$PrismaModel>
    _max?: NestedEnumInvestorTypeFilter<$PrismaModel>
  }

  export type NestedEnumInvestorTierWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.InvestorTier | EnumInvestorTierFieldRefInput<$PrismaModel>
    in?: $Enums.InvestorTier[]
    notIn?: $Enums.InvestorTier[]
    not?: NestedEnumInvestorTierWithAggregatesFilter<$PrismaModel> | $Enums.InvestorTier
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumInvestorTierFilter<$PrismaModel>
    _max?: NestedEnumInvestorTierFilter<$PrismaModel>
  }

  export type NestedEnumInvestorStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.InvestorStatus | EnumInvestorStatusFieldRefInput<$PrismaModel>
    in?: $Enums.InvestorStatus[]
    notIn?: $Enums.InvestorStatus[]
    not?: NestedEnumInvestorStatusWithAggregatesFilter<$PrismaModel> | $Enums.InvestorStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumInvestorStatusFilter<$PrismaModel>
    _max?: NestedEnumInvestorStatusFilter<$PrismaModel>
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedEnumInvestorGroupTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.InvestorGroupType | EnumInvestorGroupTypeFieldRefInput<$PrismaModel>
    in?: $Enums.InvestorGroupType[]
    notIn?: $Enums.InvestorGroupType[]
    not?: NestedEnumInvestorGroupTypeFilter<$PrismaModel> | $Enums.InvestorGroupType
  }

  export type NestedEnumInvestorGroupStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.InvestorGroupStatus | EnumInvestorGroupStatusFieldRefInput<$PrismaModel>
    in?: $Enums.InvestorGroupStatus[]
    notIn?: $Enums.InvestorGroupStatus[]
    not?: NestedEnumInvestorGroupStatusFilter<$PrismaModel> | $Enums.InvestorGroupStatus
  }

  export type NestedEnumInvestorGroupTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.InvestorGroupType | EnumInvestorGroupTypeFieldRefInput<$PrismaModel>
    in?: $Enums.InvestorGroupType[]
    notIn?: $Enums.InvestorGroupType[]
    not?: NestedEnumInvestorGroupTypeWithAggregatesFilter<$PrismaModel> | $Enums.InvestorGroupType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumInvestorGroupTypeFilter<$PrismaModel>
    _max?: NestedEnumInvestorGroupTypeFilter<$PrismaModel>
  }

  export type NestedEnumInvestorGroupStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.InvestorGroupStatus | EnumInvestorGroupStatusFieldRefInput<$PrismaModel>
    in?: $Enums.InvestorGroupStatus[]
    notIn?: $Enums.InvestorGroupStatus[]
    not?: NestedEnumInvestorGroupStatusWithAggregatesFilter<$PrismaModel> | $Enums.InvestorGroupStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumInvestorGroupStatusFilter<$PrismaModel>
    _max?: NestedEnumInvestorGroupStatusFilter<$PrismaModel>
  }

  export type NestedEnumProjectStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.ProjectStatus | EnumProjectStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ProjectStatus[]
    notIn?: $Enums.ProjectStatus[]
    not?: NestedEnumProjectStatusFilter<$PrismaModel> | $Enums.ProjectStatus
  }

  export type NestedEnumProjectStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ProjectStatus | EnumProjectStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ProjectStatus[]
    notIn?: $Enums.ProjectStatus[]
    not?: NestedEnumProjectStatusWithAggregatesFilter<$PrismaModel> | $Enums.ProjectStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumProjectStatusFilter<$PrismaModel>
    _max?: NestedEnumProjectStatusFilter<$PrismaModel>
  }

  export type NestedEnumSPCLegalTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.SPCLegalType | EnumSPCLegalTypeFieldRefInput<$PrismaModel>
    in?: $Enums.SPCLegalType[]
    notIn?: $Enums.SPCLegalType[]
    not?: NestedEnumSPCLegalTypeFilter<$PrismaModel> | $Enums.SPCLegalType
  }

  export type NestedEnumSPCStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.SPCStatus | EnumSPCStatusFieldRefInput<$PrismaModel>
    in?: $Enums.SPCStatus[]
    notIn?: $Enums.SPCStatus[]
    not?: NestedEnumSPCStatusFilter<$PrismaModel> | $Enums.SPCStatus
  }

  export type NestedEnumSPCLegalTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.SPCLegalType | EnumSPCLegalTypeFieldRefInput<$PrismaModel>
    in?: $Enums.SPCLegalType[]
    notIn?: $Enums.SPCLegalType[]
    not?: NestedEnumSPCLegalTypeWithAggregatesFilter<$PrismaModel> | $Enums.SPCLegalType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumSPCLegalTypeFilter<$PrismaModel>
    _max?: NestedEnumSPCLegalTypeFilter<$PrismaModel>
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedEnumSPCStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.SPCStatus | EnumSPCStatusFieldRefInput<$PrismaModel>
    in?: $Enums.SPCStatus[]
    notIn?: $Enums.SPCStatus[]
    not?: NestedEnumSPCStatusWithAggregatesFilter<$PrismaModel> | $Enums.SPCStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumSPCStatusFilter<$PrismaModel>
    _max?: NestedEnumSPCStatusFilter<$PrismaModel>
  }

  export type NestedEnumTrancheTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.TrancheType | EnumTrancheTypeFieldRefInput<$PrismaModel>
    in?: $Enums.TrancheType[]
    notIn?: $Enums.TrancheType[]
    not?: NestedEnumTrancheTypeFilter<$PrismaModel> | $Enums.TrancheType
  }

  export type NestedEnumTrancheStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.TrancheStatus | EnumTrancheStatusFieldRefInput<$PrismaModel>
    in?: $Enums.TrancheStatus[]
    notIn?: $Enums.TrancheStatus[]
    not?: NestedEnumTrancheStatusFilter<$PrismaModel> | $Enums.TrancheStatus
  }

  export type NestedEnumTrancheTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TrancheType | EnumTrancheTypeFieldRefInput<$PrismaModel>
    in?: $Enums.TrancheType[]
    notIn?: $Enums.TrancheType[]
    not?: NestedEnumTrancheTypeWithAggregatesFilter<$PrismaModel> | $Enums.TrancheType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTrancheTypeFilter<$PrismaModel>
    _max?: NestedEnumTrancheTypeFilter<$PrismaModel>
  }

  export type NestedFloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type NestedEnumTrancheStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TrancheStatus | EnumTrancheStatusFieldRefInput<$PrismaModel>
    in?: $Enums.TrancheStatus[]
    notIn?: $Enums.TrancheStatus[]
    not?: NestedEnumTrancheStatusWithAggregatesFilter<$PrismaModel> | $Enums.TrancheStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTrancheStatusFilter<$PrismaModel>
    _max?: NestedEnumTrancheStatusFilter<$PrismaModel>
  }

  export type NestedEnumTierTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.TierType | EnumTierTypeFieldRefInput<$PrismaModel>
    in?: $Enums.TierType[]
    notIn?: $Enums.TierType[]
    not?: NestedEnumTierTypeFilter<$PrismaModel> | $Enums.TierType
  }

  export type NestedEnumTierTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TierType | EnumTierTypeFieldRefInput<$PrismaModel>
    in?: $Enums.TierType[]
    notIn?: $Enums.TierType[]
    not?: NestedEnumTierTypeWithAggregatesFilter<$PrismaModel> | $Enums.TierType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTierTypeFilter<$PrismaModel>
    _max?: NestedEnumTierTypeFilter<$PrismaModel>
  }

  export type NestedEnumRevenueSourceFilter<$PrismaModel = never> = {
    equals?: $Enums.RevenueSource | EnumRevenueSourceFieldRefInput<$PrismaModel>
    in?: $Enums.RevenueSource[]
    notIn?: $Enums.RevenueSource[]
    not?: NestedEnumRevenueSourceFilter<$PrismaModel> | $Enums.RevenueSource
  }

  export type NestedEnumRevenueSourceWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.RevenueSource | EnumRevenueSourceFieldRefInput<$PrismaModel>
    in?: $Enums.RevenueSource[]
    notIn?: $Enums.RevenueSource[]
    not?: NestedEnumRevenueSourceWithAggregatesFilter<$PrismaModel> | $Enums.RevenueSource
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumRevenueSourceFilter<$PrismaModel>
    _max?: NestedEnumRevenueSourceFilter<$PrismaModel>
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type InvestorGroupMemberCreateWithoutInvestorInput = {
    id?: string
    commitment?: number | null
    role?: string
    joinedAt?: Date | string
    group: InvestorGroupCreateNestedOneWithoutMembersInput
  }

  export type InvestorGroupMemberUncheckedCreateWithoutInvestorInput = {
    id?: string
    groupId: string
    commitment?: number | null
    role?: string
    joinedAt?: Date | string
  }

  export type InvestorGroupMemberCreateOrConnectWithoutInvestorInput = {
    where: InvestorGroupMemberWhereUniqueInput
    create: XOR<InvestorGroupMemberCreateWithoutInvestorInput, InvestorGroupMemberUncheckedCreateWithoutInvestorInput>
  }

  export type InvestorGroupMemberCreateManyInvestorInputEnvelope = {
    data: InvestorGroupMemberCreateManyInvestorInput | InvestorGroupMemberCreateManyInvestorInput[]
  }

  export type PFTrancheInvestorCreateWithoutInvestorInput = {
    id?: string
    amount: number
    percentage?: number | null
    joinedAt?: Date | string
    notes?: string | null
    tranche: PFTrancheCreateNestedOneWithoutInvestorsInput
  }

  export type PFTrancheInvestorUncheckedCreateWithoutInvestorInput = {
    id?: string
    trancheId: string
    amount: number
    percentage?: number | null
    joinedAt?: Date | string
    notes?: string | null
  }

  export type PFTrancheInvestorCreateOrConnectWithoutInvestorInput = {
    where: PFTrancheInvestorWhereUniqueInput
    create: XOR<PFTrancheInvestorCreateWithoutInvestorInput, PFTrancheInvestorUncheckedCreateWithoutInvestorInput>
  }

  export type PFTrancheInvestorCreateManyInvestorInputEnvelope = {
    data: PFTrancheInvestorCreateManyInvestorInput | PFTrancheInvestorCreateManyInvestorInput[]
  }

  export type InvestorGroupMemberUpsertWithWhereUniqueWithoutInvestorInput = {
    where: InvestorGroupMemberWhereUniqueInput
    update: XOR<InvestorGroupMemberUpdateWithoutInvestorInput, InvestorGroupMemberUncheckedUpdateWithoutInvestorInput>
    create: XOR<InvestorGroupMemberCreateWithoutInvestorInput, InvestorGroupMemberUncheckedCreateWithoutInvestorInput>
  }

  export type InvestorGroupMemberUpdateWithWhereUniqueWithoutInvestorInput = {
    where: InvestorGroupMemberWhereUniqueInput
    data: XOR<InvestorGroupMemberUpdateWithoutInvestorInput, InvestorGroupMemberUncheckedUpdateWithoutInvestorInput>
  }

  export type InvestorGroupMemberUpdateManyWithWhereWithoutInvestorInput = {
    where: InvestorGroupMemberScalarWhereInput
    data: XOR<InvestorGroupMemberUpdateManyMutationInput, InvestorGroupMemberUncheckedUpdateManyWithoutInvestorInput>
  }

  export type InvestorGroupMemberScalarWhereInput = {
    AND?: InvestorGroupMemberScalarWhereInput | InvestorGroupMemberScalarWhereInput[]
    OR?: InvestorGroupMemberScalarWhereInput[]
    NOT?: InvestorGroupMemberScalarWhereInput | InvestorGroupMemberScalarWhereInput[]
    id?: StringFilter<"InvestorGroupMember"> | string
    groupId?: StringFilter<"InvestorGroupMember"> | string
    investorId?: StringFilter<"InvestorGroupMember"> | string
    commitment?: IntNullableFilter<"InvestorGroupMember"> | number | null
    role?: StringFilter<"InvestorGroupMember"> | string
    joinedAt?: DateTimeFilter<"InvestorGroupMember"> | Date | string
  }

  export type PFTrancheInvestorUpsertWithWhereUniqueWithoutInvestorInput = {
    where: PFTrancheInvestorWhereUniqueInput
    update: XOR<PFTrancheInvestorUpdateWithoutInvestorInput, PFTrancheInvestorUncheckedUpdateWithoutInvestorInput>
    create: XOR<PFTrancheInvestorCreateWithoutInvestorInput, PFTrancheInvestorUncheckedCreateWithoutInvestorInput>
  }

  export type PFTrancheInvestorUpdateWithWhereUniqueWithoutInvestorInput = {
    where: PFTrancheInvestorWhereUniqueInput
    data: XOR<PFTrancheInvestorUpdateWithoutInvestorInput, PFTrancheInvestorUncheckedUpdateWithoutInvestorInput>
  }

  export type PFTrancheInvestorUpdateManyWithWhereWithoutInvestorInput = {
    where: PFTrancheInvestorScalarWhereInput
    data: XOR<PFTrancheInvestorUpdateManyMutationInput, PFTrancheInvestorUncheckedUpdateManyWithoutInvestorInput>
  }

  export type PFTrancheInvestorScalarWhereInput = {
    AND?: PFTrancheInvestorScalarWhereInput | PFTrancheInvestorScalarWhereInput[]
    OR?: PFTrancheInvestorScalarWhereInput[]
    NOT?: PFTrancheInvestorScalarWhereInput | PFTrancheInvestorScalarWhereInput[]
    id?: StringFilter<"PFTrancheInvestor"> | string
    trancheId?: StringFilter<"PFTrancheInvestor"> | string
    investorId?: StringFilter<"PFTrancheInvestor"> | string
    amount?: IntFilter<"PFTrancheInvestor"> | number
    percentage?: FloatNullableFilter<"PFTrancheInvestor"> | number | null
    joinedAt?: DateTimeFilter<"PFTrancheInvestor"> | Date | string
    notes?: StringNullableFilter<"PFTrancheInvestor"> | string | null
  }

  export type InvestorGroupMemberCreateWithoutGroupInput = {
    id?: string
    commitment?: number | null
    role?: string
    joinedAt?: Date | string
    investor: InvestorCreateNestedOneWithoutGroupMembershipsInput
  }

  export type InvestorGroupMemberUncheckedCreateWithoutGroupInput = {
    id?: string
    investorId: string
    commitment?: number | null
    role?: string
    joinedAt?: Date | string
  }

  export type InvestorGroupMemberCreateOrConnectWithoutGroupInput = {
    where: InvestorGroupMemberWhereUniqueInput
    create: XOR<InvestorGroupMemberCreateWithoutGroupInput, InvestorGroupMemberUncheckedCreateWithoutGroupInput>
  }

  export type InvestorGroupMemberCreateManyGroupInputEnvelope = {
    data: InvestorGroupMemberCreateManyGroupInput | InvestorGroupMemberCreateManyGroupInput[]
  }

  export type InvestorGroupMemberUpsertWithWhereUniqueWithoutGroupInput = {
    where: InvestorGroupMemberWhereUniqueInput
    update: XOR<InvestorGroupMemberUpdateWithoutGroupInput, InvestorGroupMemberUncheckedUpdateWithoutGroupInput>
    create: XOR<InvestorGroupMemberCreateWithoutGroupInput, InvestorGroupMemberUncheckedCreateWithoutGroupInput>
  }

  export type InvestorGroupMemberUpdateWithWhereUniqueWithoutGroupInput = {
    where: InvestorGroupMemberWhereUniqueInput
    data: XOR<InvestorGroupMemberUpdateWithoutGroupInput, InvestorGroupMemberUncheckedUpdateWithoutGroupInput>
  }

  export type InvestorGroupMemberUpdateManyWithWhereWithoutGroupInput = {
    where: InvestorGroupMemberScalarWhereInput
    data: XOR<InvestorGroupMemberUpdateManyMutationInput, InvestorGroupMemberUncheckedUpdateManyWithoutGroupInput>
  }

  export type InvestorGroupCreateWithoutMembersInput = {
    id?: string
    name: string
    type: $Enums.InvestorGroupType
    managingFirm?: string | null
    totalCommitment?: number | null
    status?: $Enums.InvestorGroupStatus
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type InvestorGroupUncheckedCreateWithoutMembersInput = {
    id?: string
    name: string
    type: $Enums.InvestorGroupType
    managingFirm?: string | null
    totalCommitment?: number | null
    status?: $Enums.InvestorGroupStatus
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type InvestorGroupCreateOrConnectWithoutMembersInput = {
    where: InvestorGroupWhereUniqueInput
    create: XOR<InvestorGroupCreateWithoutMembersInput, InvestorGroupUncheckedCreateWithoutMembersInput>
  }

  export type InvestorCreateWithoutGroupMembershipsInput = {
    id?: string
    name: string
    nameEn?: string | null
    type: $Enums.InvestorType
    tier?: $Enums.InvestorTier
    status?: $Enums.InvestorStatus
    country?: string
    region?: string | null
    contactName?: string | null
    contactEmail?: string | null
    contactPhone?: string | null
    investmentCapacity?: number | null
    minTicket?: number | null
    maxTicket?: number | null
    preferredGenres?: string
    preferredBudgetRange?: string
    pastInvestments?: string
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    tranchePositions?: PFTrancheInvestorCreateNestedManyWithoutInvestorInput
  }

  export type InvestorUncheckedCreateWithoutGroupMembershipsInput = {
    id?: string
    name: string
    nameEn?: string | null
    type: $Enums.InvestorType
    tier?: $Enums.InvestorTier
    status?: $Enums.InvestorStatus
    country?: string
    region?: string | null
    contactName?: string | null
    contactEmail?: string | null
    contactPhone?: string | null
    investmentCapacity?: number | null
    minTicket?: number | null
    maxTicket?: number | null
    preferredGenres?: string
    preferredBudgetRange?: string
    pastInvestments?: string
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    tranchePositions?: PFTrancheInvestorUncheckedCreateNestedManyWithoutInvestorInput
  }

  export type InvestorCreateOrConnectWithoutGroupMembershipsInput = {
    where: InvestorWhereUniqueInput
    create: XOR<InvestorCreateWithoutGroupMembershipsInput, InvestorUncheckedCreateWithoutGroupMembershipsInput>
  }

  export type InvestorGroupUpsertWithoutMembersInput = {
    update: XOR<InvestorGroupUpdateWithoutMembersInput, InvestorGroupUncheckedUpdateWithoutMembersInput>
    create: XOR<InvestorGroupCreateWithoutMembersInput, InvestorGroupUncheckedCreateWithoutMembersInput>
    where?: InvestorGroupWhereInput
  }

  export type InvestorGroupUpdateToOneWithWhereWithoutMembersInput = {
    where?: InvestorGroupWhereInput
    data: XOR<InvestorGroupUpdateWithoutMembersInput, InvestorGroupUncheckedUpdateWithoutMembersInput>
  }

  export type InvestorGroupUpdateWithoutMembersInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: EnumInvestorGroupTypeFieldUpdateOperationsInput | $Enums.InvestorGroupType
    managingFirm?: NullableStringFieldUpdateOperationsInput | string | null
    totalCommitment?: NullableIntFieldUpdateOperationsInput | number | null
    status?: EnumInvestorGroupStatusFieldUpdateOperationsInput | $Enums.InvestorGroupStatus
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InvestorGroupUncheckedUpdateWithoutMembersInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: EnumInvestorGroupTypeFieldUpdateOperationsInput | $Enums.InvestorGroupType
    managingFirm?: NullableStringFieldUpdateOperationsInput | string | null
    totalCommitment?: NullableIntFieldUpdateOperationsInput | number | null
    status?: EnumInvestorGroupStatusFieldUpdateOperationsInput | $Enums.InvestorGroupStatus
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InvestorUpsertWithoutGroupMembershipsInput = {
    update: XOR<InvestorUpdateWithoutGroupMembershipsInput, InvestorUncheckedUpdateWithoutGroupMembershipsInput>
    create: XOR<InvestorCreateWithoutGroupMembershipsInput, InvestorUncheckedCreateWithoutGroupMembershipsInput>
    where?: InvestorWhereInput
  }

  export type InvestorUpdateToOneWithWhereWithoutGroupMembershipsInput = {
    where?: InvestorWhereInput
    data: XOR<InvestorUpdateWithoutGroupMembershipsInput, InvestorUncheckedUpdateWithoutGroupMembershipsInput>
  }

  export type InvestorUpdateWithoutGroupMembershipsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    nameEn?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumInvestorTypeFieldUpdateOperationsInput | $Enums.InvestorType
    tier?: EnumInvestorTierFieldUpdateOperationsInput | $Enums.InvestorTier
    status?: EnumInvestorStatusFieldUpdateOperationsInput | $Enums.InvestorStatus
    country?: StringFieldUpdateOperationsInput | string
    region?: NullableStringFieldUpdateOperationsInput | string | null
    contactName?: NullableStringFieldUpdateOperationsInput | string | null
    contactEmail?: NullableStringFieldUpdateOperationsInput | string | null
    contactPhone?: NullableStringFieldUpdateOperationsInput | string | null
    investmentCapacity?: NullableIntFieldUpdateOperationsInput | number | null
    minTicket?: NullableIntFieldUpdateOperationsInput | number | null
    maxTicket?: NullableIntFieldUpdateOperationsInput | number | null
    preferredGenres?: StringFieldUpdateOperationsInput | string
    preferredBudgetRange?: StringFieldUpdateOperationsInput | string
    pastInvestments?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tranchePositions?: PFTrancheInvestorUpdateManyWithoutInvestorNestedInput
  }

  export type InvestorUncheckedUpdateWithoutGroupMembershipsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    nameEn?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumInvestorTypeFieldUpdateOperationsInput | $Enums.InvestorType
    tier?: EnumInvestorTierFieldUpdateOperationsInput | $Enums.InvestorTier
    status?: EnumInvestorStatusFieldUpdateOperationsInput | $Enums.InvestorStatus
    country?: StringFieldUpdateOperationsInput | string
    region?: NullableStringFieldUpdateOperationsInput | string | null
    contactName?: NullableStringFieldUpdateOperationsInput | string | null
    contactEmail?: NullableStringFieldUpdateOperationsInput | string | null
    contactPhone?: NullableStringFieldUpdateOperationsInput | string | null
    investmentCapacity?: NullableIntFieldUpdateOperationsInput | number | null
    minTicket?: NullableIntFieldUpdateOperationsInput | number | null
    maxTicket?: NullableIntFieldUpdateOperationsInput | number | null
    preferredGenres?: StringFieldUpdateOperationsInput | string
    preferredBudgetRange?: StringFieldUpdateOperationsInput | string
    pastInvestments?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tranchePositions?: PFTrancheInvestorUncheckedUpdateManyWithoutInvestorNestedInput
  }

  export type SPCCreateWithoutProjectInput = {
    id?: string
    name: string
    legalType?: $Enums.SPCLegalType
    registrationNumber?: string | null
    incorporationDate?: string | null
    totalCapital?: number | null
    totalBudget?: number | null
    raisedAmount?: number
    status?: $Enums.SPCStatus
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    tranches?: PFTrancheCreateNestedManyWithoutSpcInput
    waterfallTiers?: WaterfallTierCreateNestedManyWithoutSpcInput
    revenueEvents?: RevenueEventCreateNestedManyWithoutSpcInput
  }

  export type SPCUncheckedCreateWithoutProjectInput = {
    id?: string
    name: string
    legalType?: $Enums.SPCLegalType
    registrationNumber?: string | null
    incorporationDate?: string | null
    totalCapital?: number | null
    totalBudget?: number | null
    raisedAmount?: number
    status?: $Enums.SPCStatus
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    tranches?: PFTrancheUncheckedCreateNestedManyWithoutSpcInput
    waterfallTiers?: WaterfallTierUncheckedCreateNestedManyWithoutSpcInput
    revenueEvents?: RevenueEventUncheckedCreateNestedManyWithoutSpcInput
  }

  export type SPCCreateOrConnectWithoutProjectInput = {
    where: SPCWhereUniqueInput
    create: XOR<SPCCreateWithoutProjectInput, SPCUncheckedCreateWithoutProjectInput>
  }

  export type SPCCreateManyProjectInputEnvelope = {
    data: SPCCreateManyProjectInput | SPCCreateManyProjectInput[]
  }

  export type SPCUpsertWithWhereUniqueWithoutProjectInput = {
    where: SPCWhereUniqueInput
    update: XOR<SPCUpdateWithoutProjectInput, SPCUncheckedUpdateWithoutProjectInput>
    create: XOR<SPCCreateWithoutProjectInput, SPCUncheckedCreateWithoutProjectInput>
  }

  export type SPCUpdateWithWhereUniqueWithoutProjectInput = {
    where: SPCWhereUniqueInput
    data: XOR<SPCUpdateWithoutProjectInput, SPCUncheckedUpdateWithoutProjectInput>
  }

  export type SPCUpdateManyWithWhereWithoutProjectInput = {
    where: SPCScalarWhereInput
    data: XOR<SPCUpdateManyMutationInput, SPCUncheckedUpdateManyWithoutProjectInput>
  }

  export type SPCScalarWhereInput = {
    AND?: SPCScalarWhereInput | SPCScalarWhereInput[]
    OR?: SPCScalarWhereInput[]
    NOT?: SPCScalarWhereInput | SPCScalarWhereInput[]
    id?: StringFilter<"SPC"> | string
    projectId?: StringFilter<"SPC"> | string
    name?: StringFilter<"SPC"> | string
    legalType?: EnumSPCLegalTypeFilter<"SPC"> | $Enums.SPCLegalType
    registrationNumber?: StringNullableFilter<"SPC"> | string | null
    incorporationDate?: StringNullableFilter<"SPC"> | string | null
    totalCapital?: IntNullableFilter<"SPC"> | number | null
    totalBudget?: IntNullableFilter<"SPC"> | number | null
    raisedAmount?: IntFilter<"SPC"> | number
    status?: EnumSPCStatusFilter<"SPC"> | $Enums.SPCStatus
    notes?: StringNullableFilter<"SPC"> | string | null
    createdAt?: DateTimeFilter<"SPC"> | Date | string
    updatedAt?: DateTimeFilter<"SPC"> | Date | string
  }

  export type FilmProjectCreateWithoutSpcsInput = {
    id?: string
    title: string
    titleEn?: string | null
    genre?: string | null
    logline?: string | null
    totalBudget?: number | null
    budgetBreakdown?: string
    status?: $Enums.ProjectStatus
    targetReleaseDate?: string | null
    scriptId?: string | null
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type FilmProjectUncheckedCreateWithoutSpcsInput = {
    id?: string
    title: string
    titleEn?: string | null
    genre?: string | null
    logline?: string | null
    totalBudget?: number | null
    budgetBreakdown?: string
    status?: $Enums.ProjectStatus
    targetReleaseDate?: string | null
    scriptId?: string | null
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type FilmProjectCreateOrConnectWithoutSpcsInput = {
    where: FilmProjectWhereUniqueInput
    create: XOR<FilmProjectCreateWithoutSpcsInput, FilmProjectUncheckedCreateWithoutSpcsInput>
  }

  export type PFTrancheCreateWithoutSpcInput = {
    id?: string
    name: string
    type: $Enums.TrancheType
    priority: number
    targetAmount: number
    raisedAmount?: number
    interestRate?: number | null
    targetReturn?: number | null
    termMonths?: number | null
    status?: $Enums.TrancheStatus
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    investors?: PFTrancheInvestorCreateNestedManyWithoutTrancheInput
    waterfallTiers?: WaterfallTierCreateNestedManyWithoutTrancheInput
  }

  export type PFTrancheUncheckedCreateWithoutSpcInput = {
    id?: string
    name: string
    type: $Enums.TrancheType
    priority: number
    targetAmount: number
    raisedAmount?: number
    interestRate?: number | null
    targetReturn?: number | null
    termMonths?: number | null
    status?: $Enums.TrancheStatus
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    investors?: PFTrancheInvestorUncheckedCreateNestedManyWithoutTrancheInput
    waterfallTiers?: WaterfallTierUncheckedCreateNestedManyWithoutTrancheInput
  }

  export type PFTrancheCreateOrConnectWithoutSpcInput = {
    where: PFTrancheWhereUniqueInput
    create: XOR<PFTrancheCreateWithoutSpcInput, PFTrancheUncheckedCreateWithoutSpcInput>
  }

  export type PFTrancheCreateManySpcInputEnvelope = {
    data: PFTrancheCreateManySpcInput | PFTrancheCreateManySpcInput[]
  }

  export type WaterfallTierCreateWithoutSpcInput = {
    id?: string
    priority: number
    name: string
    type: $Enums.TierType
    amountCap?: number | null
    percentage?: number | null
    multiplier?: number | null
    description?: string | null
    tranche?: PFTrancheCreateNestedOneWithoutWaterfallTiersInput
  }

  export type WaterfallTierUncheckedCreateWithoutSpcInput = {
    id?: string
    priority: number
    name: string
    type: $Enums.TierType
    trancheId?: string | null
    amountCap?: number | null
    percentage?: number | null
    multiplier?: number | null
    description?: string | null
  }

  export type WaterfallTierCreateOrConnectWithoutSpcInput = {
    where: WaterfallTierWhereUniqueInput
    create: XOR<WaterfallTierCreateWithoutSpcInput, WaterfallTierUncheckedCreateWithoutSpcInput>
  }

  export type WaterfallTierCreateManySpcInputEnvelope = {
    data: WaterfallTierCreateManySpcInput | WaterfallTierCreateManySpcInput[]
  }

  export type RevenueEventCreateWithoutSpcInput = {
    id?: string
    amount: number
    source: $Enums.RevenueSource
    eventDate: string
    notes?: string | null
    distributionStatus?: string
    createdAt?: Date | string
    distributions?: WaterfallDistributionCreateNestedManyWithoutEventInput
  }

  export type RevenueEventUncheckedCreateWithoutSpcInput = {
    id?: string
    amount: number
    source: $Enums.RevenueSource
    eventDate: string
    notes?: string | null
    distributionStatus?: string
    createdAt?: Date | string
    distributions?: WaterfallDistributionUncheckedCreateNestedManyWithoutEventInput
  }

  export type RevenueEventCreateOrConnectWithoutSpcInput = {
    where: RevenueEventWhereUniqueInput
    create: XOR<RevenueEventCreateWithoutSpcInput, RevenueEventUncheckedCreateWithoutSpcInput>
  }

  export type RevenueEventCreateManySpcInputEnvelope = {
    data: RevenueEventCreateManySpcInput | RevenueEventCreateManySpcInput[]
  }

  export type FilmProjectUpsertWithoutSpcsInput = {
    update: XOR<FilmProjectUpdateWithoutSpcsInput, FilmProjectUncheckedUpdateWithoutSpcsInput>
    create: XOR<FilmProjectCreateWithoutSpcsInput, FilmProjectUncheckedCreateWithoutSpcsInput>
    where?: FilmProjectWhereInput
  }

  export type FilmProjectUpdateToOneWithWhereWithoutSpcsInput = {
    where?: FilmProjectWhereInput
    data: XOR<FilmProjectUpdateWithoutSpcsInput, FilmProjectUncheckedUpdateWithoutSpcsInput>
  }

  export type FilmProjectUpdateWithoutSpcsInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    titleEn?: NullableStringFieldUpdateOperationsInput | string | null
    genre?: NullableStringFieldUpdateOperationsInput | string | null
    logline?: NullableStringFieldUpdateOperationsInput | string | null
    totalBudget?: NullableIntFieldUpdateOperationsInput | number | null
    budgetBreakdown?: StringFieldUpdateOperationsInput | string
    status?: EnumProjectStatusFieldUpdateOperationsInput | $Enums.ProjectStatus
    targetReleaseDate?: NullableStringFieldUpdateOperationsInput | string | null
    scriptId?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FilmProjectUncheckedUpdateWithoutSpcsInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    titleEn?: NullableStringFieldUpdateOperationsInput | string | null
    genre?: NullableStringFieldUpdateOperationsInput | string | null
    logline?: NullableStringFieldUpdateOperationsInput | string | null
    totalBudget?: NullableIntFieldUpdateOperationsInput | number | null
    budgetBreakdown?: StringFieldUpdateOperationsInput | string
    status?: EnumProjectStatusFieldUpdateOperationsInput | $Enums.ProjectStatus
    targetReleaseDate?: NullableStringFieldUpdateOperationsInput | string | null
    scriptId?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PFTrancheUpsertWithWhereUniqueWithoutSpcInput = {
    where: PFTrancheWhereUniqueInput
    update: XOR<PFTrancheUpdateWithoutSpcInput, PFTrancheUncheckedUpdateWithoutSpcInput>
    create: XOR<PFTrancheCreateWithoutSpcInput, PFTrancheUncheckedCreateWithoutSpcInput>
  }

  export type PFTrancheUpdateWithWhereUniqueWithoutSpcInput = {
    where: PFTrancheWhereUniqueInput
    data: XOR<PFTrancheUpdateWithoutSpcInput, PFTrancheUncheckedUpdateWithoutSpcInput>
  }

  export type PFTrancheUpdateManyWithWhereWithoutSpcInput = {
    where: PFTrancheScalarWhereInput
    data: XOR<PFTrancheUpdateManyMutationInput, PFTrancheUncheckedUpdateManyWithoutSpcInput>
  }

  export type PFTrancheScalarWhereInput = {
    AND?: PFTrancheScalarWhereInput | PFTrancheScalarWhereInput[]
    OR?: PFTrancheScalarWhereInput[]
    NOT?: PFTrancheScalarWhereInput | PFTrancheScalarWhereInput[]
    id?: StringFilter<"PFTranche"> | string
    spcId?: StringFilter<"PFTranche"> | string
    name?: StringFilter<"PFTranche"> | string
    type?: EnumTrancheTypeFilter<"PFTranche"> | $Enums.TrancheType
    priority?: IntFilter<"PFTranche"> | number
    targetAmount?: IntFilter<"PFTranche"> | number
    raisedAmount?: IntFilter<"PFTranche"> | number
    interestRate?: FloatNullableFilter<"PFTranche"> | number | null
    targetReturn?: FloatNullableFilter<"PFTranche"> | number | null
    termMonths?: IntNullableFilter<"PFTranche"> | number | null
    status?: EnumTrancheStatusFilter<"PFTranche"> | $Enums.TrancheStatus
    notes?: StringNullableFilter<"PFTranche"> | string | null
    createdAt?: DateTimeFilter<"PFTranche"> | Date | string
    updatedAt?: DateTimeFilter<"PFTranche"> | Date | string
  }

  export type WaterfallTierUpsertWithWhereUniqueWithoutSpcInput = {
    where: WaterfallTierWhereUniqueInput
    update: XOR<WaterfallTierUpdateWithoutSpcInput, WaterfallTierUncheckedUpdateWithoutSpcInput>
    create: XOR<WaterfallTierCreateWithoutSpcInput, WaterfallTierUncheckedCreateWithoutSpcInput>
  }

  export type WaterfallTierUpdateWithWhereUniqueWithoutSpcInput = {
    where: WaterfallTierWhereUniqueInput
    data: XOR<WaterfallTierUpdateWithoutSpcInput, WaterfallTierUncheckedUpdateWithoutSpcInput>
  }

  export type WaterfallTierUpdateManyWithWhereWithoutSpcInput = {
    where: WaterfallTierScalarWhereInput
    data: XOR<WaterfallTierUpdateManyMutationInput, WaterfallTierUncheckedUpdateManyWithoutSpcInput>
  }

  export type WaterfallTierScalarWhereInput = {
    AND?: WaterfallTierScalarWhereInput | WaterfallTierScalarWhereInput[]
    OR?: WaterfallTierScalarWhereInput[]
    NOT?: WaterfallTierScalarWhereInput | WaterfallTierScalarWhereInput[]
    id?: StringFilter<"WaterfallTier"> | string
    spcId?: StringFilter<"WaterfallTier"> | string
    priority?: IntFilter<"WaterfallTier"> | number
    name?: StringFilter<"WaterfallTier"> | string
    type?: EnumTierTypeFilter<"WaterfallTier"> | $Enums.TierType
    trancheId?: StringNullableFilter<"WaterfallTier"> | string | null
    amountCap?: IntNullableFilter<"WaterfallTier"> | number | null
    percentage?: FloatNullableFilter<"WaterfallTier"> | number | null
    multiplier?: FloatNullableFilter<"WaterfallTier"> | number | null
    description?: StringNullableFilter<"WaterfallTier"> | string | null
  }

  export type RevenueEventUpsertWithWhereUniqueWithoutSpcInput = {
    where: RevenueEventWhereUniqueInput
    update: XOR<RevenueEventUpdateWithoutSpcInput, RevenueEventUncheckedUpdateWithoutSpcInput>
    create: XOR<RevenueEventCreateWithoutSpcInput, RevenueEventUncheckedCreateWithoutSpcInput>
  }

  export type RevenueEventUpdateWithWhereUniqueWithoutSpcInput = {
    where: RevenueEventWhereUniqueInput
    data: XOR<RevenueEventUpdateWithoutSpcInput, RevenueEventUncheckedUpdateWithoutSpcInput>
  }

  export type RevenueEventUpdateManyWithWhereWithoutSpcInput = {
    where: RevenueEventScalarWhereInput
    data: XOR<RevenueEventUpdateManyMutationInput, RevenueEventUncheckedUpdateManyWithoutSpcInput>
  }

  export type RevenueEventScalarWhereInput = {
    AND?: RevenueEventScalarWhereInput | RevenueEventScalarWhereInput[]
    OR?: RevenueEventScalarWhereInput[]
    NOT?: RevenueEventScalarWhereInput | RevenueEventScalarWhereInput[]
    id?: StringFilter<"RevenueEvent"> | string
    spcId?: StringFilter<"RevenueEvent"> | string
    amount?: IntFilter<"RevenueEvent"> | number
    source?: EnumRevenueSourceFilter<"RevenueEvent"> | $Enums.RevenueSource
    eventDate?: StringFilter<"RevenueEvent"> | string
    notes?: StringNullableFilter<"RevenueEvent"> | string | null
    distributionStatus?: StringFilter<"RevenueEvent"> | string
    createdAt?: DateTimeFilter<"RevenueEvent"> | Date | string
  }

  export type SPCCreateWithoutTranchesInput = {
    id?: string
    name: string
    legalType?: $Enums.SPCLegalType
    registrationNumber?: string | null
    incorporationDate?: string | null
    totalCapital?: number | null
    totalBudget?: number | null
    raisedAmount?: number
    status?: $Enums.SPCStatus
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    project: FilmProjectCreateNestedOneWithoutSpcsInput
    waterfallTiers?: WaterfallTierCreateNestedManyWithoutSpcInput
    revenueEvents?: RevenueEventCreateNestedManyWithoutSpcInput
  }

  export type SPCUncheckedCreateWithoutTranchesInput = {
    id?: string
    projectId: string
    name: string
    legalType?: $Enums.SPCLegalType
    registrationNumber?: string | null
    incorporationDate?: string | null
    totalCapital?: number | null
    totalBudget?: number | null
    raisedAmount?: number
    status?: $Enums.SPCStatus
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    waterfallTiers?: WaterfallTierUncheckedCreateNestedManyWithoutSpcInput
    revenueEvents?: RevenueEventUncheckedCreateNestedManyWithoutSpcInput
  }

  export type SPCCreateOrConnectWithoutTranchesInput = {
    where: SPCWhereUniqueInput
    create: XOR<SPCCreateWithoutTranchesInput, SPCUncheckedCreateWithoutTranchesInput>
  }

  export type PFTrancheInvestorCreateWithoutTrancheInput = {
    id?: string
    amount: number
    percentage?: number | null
    joinedAt?: Date | string
    notes?: string | null
    investor: InvestorCreateNestedOneWithoutTranchePositionsInput
  }

  export type PFTrancheInvestorUncheckedCreateWithoutTrancheInput = {
    id?: string
    investorId: string
    amount: number
    percentage?: number | null
    joinedAt?: Date | string
    notes?: string | null
  }

  export type PFTrancheInvestorCreateOrConnectWithoutTrancheInput = {
    where: PFTrancheInvestorWhereUniqueInput
    create: XOR<PFTrancheInvestorCreateWithoutTrancheInput, PFTrancheInvestorUncheckedCreateWithoutTrancheInput>
  }

  export type PFTrancheInvestorCreateManyTrancheInputEnvelope = {
    data: PFTrancheInvestorCreateManyTrancheInput | PFTrancheInvestorCreateManyTrancheInput[]
  }

  export type WaterfallTierCreateWithoutTrancheInput = {
    id?: string
    priority: number
    name: string
    type: $Enums.TierType
    amountCap?: number | null
    percentage?: number | null
    multiplier?: number | null
    description?: string | null
    spc: SPCCreateNestedOneWithoutWaterfallTiersInput
  }

  export type WaterfallTierUncheckedCreateWithoutTrancheInput = {
    id?: string
    spcId: string
    priority: number
    name: string
    type: $Enums.TierType
    amountCap?: number | null
    percentage?: number | null
    multiplier?: number | null
    description?: string | null
  }

  export type WaterfallTierCreateOrConnectWithoutTrancheInput = {
    where: WaterfallTierWhereUniqueInput
    create: XOR<WaterfallTierCreateWithoutTrancheInput, WaterfallTierUncheckedCreateWithoutTrancheInput>
  }

  export type WaterfallTierCreateManyTrancheInputEnvelope = {
    data: WaterfallTierCreateManyTrancheInput | WaterfallTierCreateManyTrancheInput[]
  }

  export type SPCUpsertWithoutTranchesInput = {
    update: XOR<SPCUpdateWithoutTranchesInput, SPCUncheckedUpdateWithoutTranchesInput>
    create: XOR<SPCCreateWithoutTranchesInput, SPCUncheckedCreateWithoutTranchesInput>
    where?: SPCWhereInput
  }

  export type SPCUpdateToOneWithWhereWithoutTranchesInput = {
    where?: SPCWhereInput
    data: XOR<SPCUpdateWithoutTranchesInput, SPCUncheckedUpdateWithoutTranchesInput>
  }

  export type SPCUpdateWithoutTranchesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    legalType?: EnumSPCLegalTypeFieldUpdateOperationsInput | $Enums.SPCLegalType
    registrationNumber?: NullableStringFieldUpdateOperationsInput | string | null
    incorporationDate?: NullableStringFieldUpdateOperationsInput | string | null
    totalCapital?: NullableIntFieldUpdateOperationsInput | number | null
    totalBudget?: NullableIntFieldUpdateOperationsInput | number | null
    raisedAmount?: IntFieldUpdateOperationsInput | number
    status?: EnumSPCStatusFieldUpdateOperationsInput | $Enums.SPCStatus
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    project?: FilmProjectUpdateOneRequiredWithoutSpcsNestedInput
    waterfallTiers?: WaterfallTierUpdateManyWithoutSpcNestedInput
    revenueEvents?: RevenueEventUpdateManyWithoutSpcNestedInput
  }

  export type SPCUncheckedUpdateWithoutTranchesInput = {
    id?: StringFieldUpdateOperationsInput | string
    projectId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    legalType?: EnumSPCLegalTypeFieldUpdateOperationsInput | $Enums.SPCLegalType
    registrationNumber?: NullableStringFieldUpdateOperationsInput | string | null
    incorporationDate?: NullableStringFieldUpdateOperationsInput | string | null
    totalCapital?: NullableIntFieldUpdateOperationsInput | number | null
    totalBudget?: NullableIntFieldUpdateOperationsInput | number | null
    raisedAmount?: IntFieldUpdateOperationsInput | number
    status?: EnumSPCStatusFieldUpdateOperationsInput | $Enums.SPCStatus
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    waterfallTiers?: WaterfallTierUncheckedUpdateManyWithoutSpcNestedInput
    revenueEvents?: RevenueEventUncheckedUpdateManyWithoutSpcNestedInput
  }

  export type PFTrancheInvestorUpsertWithWhereUniqueWithoutTrancheInput = {
    where: PFTrancheInvestorWhereUniqueInput
    update: XOR<PFTrancheInvestorUpdateWithoutTrancheInput, PFTrancheInvestorUncheckedUpdateWithoutTrancheInput>
    create: XOR<PFTrancheInvestorCreateWithoutTrancheInput, PFTrancheInvestorUncheckedCreateWithoutTrancheInput>
  }

  export type PFTrancheInvestorUpdateWithWhereUniqueWithoutTrancheInput = {
    where: PFTrancheInvestorWhereUniqueInput
    data: XOR<PFTrancheInvestorUpdateWithoutTrancheInput, PFTrancheInvestorUncheckedUpdateWithoutTrancheInput>
  }

  export type PFTrancheInvestorUpdateManyWithWhereWithoutTrancheInput = {
    where: PFTrancheInvestorScalarWhereInput
    data: XOR<PFTrancheInvestorUpdateManyMutationInput, PFTrancheInvestorUncheckedUpdateManyWithoutTrancheInput>
  }

  export type WaterfallTierUpsertWithWhereUniqueWithoutTrancheInput = {
    where: WaterfallTierWhereUniqueInput
    update: XOR<WaterfallTierUpdateWithoutTrancheInput, WaterfallTierUncheckedUpdateWithoutTrancheInput>
    create: XOR<WaterfallTierCreateWithoutTrancheInput, WaterfallTierUncheckedCreateWithoutTrancheInput>
  }

  export type WaterfallTierUpdateWithWhereUniqueWithoutTrancheInput = {
    where: WaterfallTierWhereUniqueInput
    data: XOR<WaterfallTierUpdateWithoutTrancheInput, WaterfallTierUncheckedUpdateWithoutTrancheInput>
  }

  export type WaterfallTierUpdateManyWithWhereWithoutTrancheInput = {
    where: WaterfallTierScalarWhereInput
    data: XOR<WaterfallTierUpdateManyMutationInput, WaterfallTierUncheckedUpdateManyWithoutTrancheInput>
  }

  export type PFTrancheCreateWithoutInvestorsInput = {
    id?: string
    name: string
    type: $Enums.TrancheType
    priority: number
    targetAmount: number
    raisedAmount?: number
    interestRate?: number | null
    targetReturn?: number | null
    termMonths?: number | null
    status?: $Enums.TrancheStatus
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    spc: SPCCreateNestedOneWithoutTranchesInput
    waterfallTiers?: WaterfallTierCreateNestedManyWithoutTrancheInput
  }

  export type PFTrancheUncheckedCreateWithoutInvestorsInput = {
    id?: string
    spcId: string
    name: string
    type: $Enums.TrancheType
    priority: number
    targetAmount: number
    raisedAmount?: number
    interestRate?: number | null
    targetReturn?: number | null
    termMonths?: number | null
    status?: $Enums.TrancheStatus
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    waterfallTiers?: WaterfallTierUncheckedCreateNestedManyWithoutTrancheInput
  }

  export type PFTrancheCreateOrConnectWithoutInvestorsInput = {
    where: PFTrancheWhereUniqueInput
    create: XOR<PFTrancheCreateWithoutInvestorsInput, PFTrancheUncheckedCreateWithoutInvestorsInput>
  }

  export type InvestorCreateWithoutTranchePositionsInput = {
    id?: string
    name: string
    nameEn?: string | null
    type: $Enums.InvestorType
    tier?: $Enums.InvestorTier
    status?: $Enums.InvestorStatus
    country?: string
    region?: string | null
    contactName?: string | null
    contactEmail?: string | null
    contactPhone?: string | null
    investmentCapacity?: number | null
    minTicket?: number | null
    maxTicket?: number | null
    preferredGenres?: string
    preferredBudgetRange?: string
    pastInvestments?: string
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    groupMemberships?: InvestorGroupMemberCreateNestedManyWithoutInvestorInput
  }

  export type InvestorUncheckedCreateWithoutTranchePositionsInput = {
    id?: string
    name: string
    nameEn?: string | null
    type: $Enums.InvestorType
    tier?: $Enums.InvestorTier
    status?: $Enums.InvestorStatus
    country?: string
    region?: string | null
    contactName?: string | null
    contactEmail?: string | null
    contactPhone?: string | null
    investmentCapacity?: number | null
    minTicket?: number | null
    maxTicket?: number | null
    preferredGenres?: string
    preferredBudgetRange?: string
    pastInvestments?: string
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    groupMemberships?: InvestorGroupMemberUncheckedCreateNestedManyWithoutInvestorInput
  }

  export type InvestorCreateOrConnectWithoutTranchePositionsInput = {
    where: InvestorWhereUniqueInput
    create: XOR<InvestorCreateWithoutTranchePositionsInput, InvestorUncheckedCreateWithoutTranchePositionsInput>
  }

  export type PFTrancheUpsertWithoutInvestorsInput = {
    update: XOR<PFTrancheUpdateWithoutInvestorsInput, PFTrancheUncheckedUpdateWithoutInvestorsInput>
    create: XOR<PFTrancheCreateWithoutInvestorsInput, PFTrancheUncheckedCreateWithoutInvestorsInput>
    where?: PFTrancheWhereInput
  }

  export type PFTrancheUpdateToOneWithWhereWithoutInvestorsInput = {
    where?: PFTrancheWhereInput
    data: XOR<PFTrancheUpdateWithoutInvestorsInput, PFTrancheUncheckedUpdateWithoutInvestorsInput>
  }

  export type PFTrancheUpdateWithoutInvestorsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: EnumTrancheTypeFieldUpdateOperationsInput | $Enums.TrancheType
    priority?: IntFieldUpdateOperationsInput | number
    targetAmount?: IntFieldUpdateOperationsInput | number
    raisedAmount?: IntFieldUpdateOperationsInput | number
    interestRate?: NullableFloatFieldUpdateOperationsInput | number | null
    targetReturn?: NullableFloatFieldUpdateOperationsInput | number | null
    termMonths?: NullableIntFieldUpdateOperationsInput | number | null
    status?: EnumTrancheStatusFieldUpdateOperationsInput | $Enums.TrancheStatus
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    spc?: SPCUpdateOneRequiredWithoutTranchesNestedInput
    waterfallTiers?: WaterfallTierUpdateManyWithoutTrancheNestedInput
  }

  export type PFTrancheUncheckedUpdateWithoutInvestorsInput = {
    id?: StringFieldUpdateOperationsInput | string
    spcId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: EnumTrancheTypeFieldUpdateOperationsInput | $Enums.TrancheType
    priority?: IntFieldUpdateOperationsInput | number
    targetAmount?: IntFieldUpdateOperationsInput | number
    raisedAmount?: IntFieldUpdateOperationsInput | number
    interestRate?: NullableFloatFieldUpdateOperationsInput | number | null
    targetReturn?: NullableFloatFieldUpdateOperationsInput | number | null
    termMonths?: NullableIntFieldUpdateOperationsInput | number | null
    status?: EnumTrancheStatusFieldUpdateOperationsInput | $Enums.TrancheStatus
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    waterfallTiers?: WaterfallTierUncheckedUpdateManyWithoutTrancheNestedInput
  }

  export type InvestorUpsertWithoutTranchePositionsInput = {
    update: XOR<InvestorUpdateWithoutTranchePositionsInput, InvestorUncheckedUpdateWithoutTranchePositionsInput>
    create: XOR<InvestorCreateWithoutTranchePositionsInput, InvestorUncheckedCreateWithoutTranchePositionsInput>
    where?: InvestorWhereInput
  }

  export type InvestorUpdateToOneWithWhereWithoutTranchePositionsInput = {
    where?: InvestorWhereInput
    data: XOR<InvestorUpdateWithoutTranchePositionsInput, InvestorUncheckedUpdateWithoutTranchePositionsInput>
  }

  export type InvestorUpdateWithoutTranchePositionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    nameEn?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumInvestorTypeFieldUpdateOperationsInput | $Enums.InvestorType
    tier?: EnumInvestorTierFieldUpdateOperationsInput | $Enums.InvestorTier
    status?: EnumInvestorStatusFieldUpdateOperationsInput | $Enums.InvestorStatus
    country?: StringFieldUpdateOperationsInput | string
    region?: NullableStringFieldUpdateOperationsInput | string | null
    contactName?: NullableStringFieldUpdateOperationsInput | string | null
    contactEmail?: NullableStringFieldUpdateOperationsInput | string | null
    contactPhone?: NullableStringFieldUpdateOperationsInput | string | null
    investmentCapacity?: NullableIntFieldUpdateOperationsInput | number | null
    minTicket?: NullableIntFieldUpdateOperationsInput | number | null
    maxTicket?: NullableIntFieldUpdateOperationsInput | number | null
    preferredGenres?: StringFieldUpdateOperationsInput | string
    preferredBudgetRange?: StringFieldUpdateOperationsInput | string
    pastInvestments?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    groupMemberships?: InvestorGroupMemberUpdateManyWithoutInvestorNestedInput
  }

  export type InvestorUncheckedUpdateWithoutTranchePositionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    nameEn?: NullableStringFieldUpdateOperationsInput | string | null
    type?: EnumInvestorTypeFieldUpdateOperationsInput | $Enums.InvestorType
    tier?: EnumInvestorTierFieldUpdateOperationsInput | $Enums.InvestorTier
    status?: EnumInvestorStatusFieldUpdateOperationsInput | $Enums.InvestorStatus
    country?: StringFieldUpdateOperationsInput | string
    region?: NullableStringFieldUpdateOperationsInput | string | null
    contactName?: NullableStringFieldUpdateOperationsInput | string | null
    contactEmail?: NullableStringFieldUpdateOperationsInput | string | null
    contactPhone?: NullableStringFieldUpdateOperationsInput | string | null
    investmentCapacity?: NullableIntFieldUpdateOperationsInput | number | null
    minTicket?: NullableIntFieldUpdateOperationsInput | number | null
    maxTicket?: NullableIntFieldUpdateOperationsInput | number | null
    preferredGenres?: StringFieldUpdateOperationsInput | string
    preferredBudgetRange?: StringFieldUpdateOperationsInput | string
    pastInvestments?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    groupMemberships?: InvestorGroupMemberUncheckedUpdateManyWithoutInvestorNestedInput
  }

  export type SPCCreateWithoutWaterfallTiersInput = {
    id?: string
    name: string
    legalType?: $Enums.SPCLegalType
    registrationNumber?: string | null
    incorporationDate?: string | null
    totalCapital?: number | null
    totalBudget?: number | null
    raisedAmount?: number
    status?: $Enums.SPCStatus
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    project: FilmProjectCreateNestedOneWithoutSpcsInput
    tranches?: PFTrancheCreateNestedManyWithoutSpcInput
    revenueEvents?: RevenueEventCreateNestedManyWithoutSpcInput
  }

  export type SPCUncheckedCreateWithoutWaterfallTiersInput = {
    id?: string
    projectId: string
    name: string
    legalType?: $Enums.SPCLegalType
    registrationNumber?: string | null
    incorporationDate?: string | null
    totalCapital?: number | null
    totalBudget?: number | null
    raisedAmount?: number
    status?: $Enums.SPCStatus
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    tranches?: PFTrancheUncheckedCreateNestedManyWithoutSpcInput
    revenueEvents?: RevenueEventUncheckedCreateNestedManyWithoutSpcInput
  }

  export type SPCCreateOrConnectWithoutWaterfallTiersInput = {
    where: SPCWhereUniqueInput
    create: XOR<SPCCreateWithoutWaterfallTiersInput, SPCUncheckedCreateWithoutWaterfallTiersInput>
  }

  export type PFTrancheCreateWithoutWaterfallTiersInput = {
    id?: string
    name: string
    type: $Enums.TrancheType
    priority: number
    targetAmount: number
    raisedAmount?: number
    interestRate?: number | null
    targetReturn?: number | null
    termMonths?: number | null
    status?: $Enums.TrancheStatus
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    spc: SPCCreateNestedOneWithoutTranchesInput
    investors?: PFTrancheInvestorCreateNestedManyWithoutTrancheInput
  }

  export type PFTrancheUncheckedCreateWithoutWaterfallTiersInput = {
    id?: string
    spcId: string
    name: string
    type: $Enums.TrancheType
    priority: number
    targetAmount: number
    raisedAmount?: number
    interestRate?: number | null
    targetReturn?: number | null
    termMonths?: number | null
    status?: $Enums.TrancheStatus
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    investors?: PFTrancheInvestorUncheckedCreateNestedManyWithoutTrancheInput
  }

  export type PFTrancheCreateOrConnectWithoutWaterfallTiersInput = {
    where: PFTrancheWhereUniqueInput
    create: XOR<PFTrancheCreateWithoutWaterfallTiersInput, PFTrancheUncheckedCreateWithoutWaterfallTiersInput>
  }

  export type SPCUpsertWithoutWaterfallTiersInput = {
    update: XOR<SPCUpdateWithoutWaterfallTiersInput, SPCUncheckedUpdateWithoutWaterfallTiersInput>
    create: XOR<SPCCreateWithoutWaterfallTiersInput, SPCUncheckedCreateWithoutWaterfallTiersInput>
    where?: SPCWhereInput
  }

  export type SPCUpdateToOneWithWhereWithoutWaterfallTiersInput = {
    where?: SPCWhereInput
    data: XOR<SPCUpdateWithoutWaterfallTiersInput, SPCUncheckedUpdateWithoutWaterfallTiersInput>
  }

  export type SPCUpdateWithoutWaterfallTiersInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    legalType?: EnumSPCLegalTypeFieldUpdateOperationsInput | $Enums.SPCLegalType
    registrationNumber?: NullableStringFieldUpdateOperationsInput | string | null
    incorporationDate?: NullableStringFieldUpdateOperationsInput | string | null
    totalCapital?: NullableIntFieldUpdateOperationsInput | number | null
    totalBudget?: NullableIntFieldUpdateOperationsInput | number | null
    raisedAmount?: IntFieldUpdateOperationsInput | number
    status?: EnumSPCStatusFieldUpdateOperationsInput | $Enums.SPCStatus
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    project?: FilmProjectUpdateOneRequiredWithoutSpcsNestedInput
    tranches?: PFTrancheUpdateManyWithoutSpcNestedInput
    revenueEvents?: RevenueEventUpdateManyWithoutSpcNestedInput
  }

  export type SPCUncheckedUpdateWithoutWaterfallTiersInput = {
    id?: StringFieldUpdateOperationsInput | string
    projectId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    legalType?: EnumSPCLegalTypeFieldUpdateOperationsInput | $Enums.SPCLegalType
    registrationNumber?: NullableStringFieldUpdateOperationsInput | string | null
    incorporationDate?: NullableStringFieldUpdateOperationsInput | string | null
    totalCapital?: NullableIntFieldUpdateOperationsInput | number | null
    totalBudget?: NullableIntFieldUpdateOperationsInput | number | null
    raisedAmount?: IntFieldUpdateOperationsInput | number
    status?: EnumSPCStatusFieldUpdateOperationsInput | $Enums.SPCStatus
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tranches?: PFTrancheUncheckedUpdateManyWithoutSpcNestedInput
    revenueEvents?: RevenueEventUncheckedUpdateManyWithoutSpcNestedInput
  }

  export type PFTrancheUpsertWithoutWaterfallTiersInput = {
    update: XOR<PFTrancheUpdateWithoutWaterfallTiersInput, PFTrancheUncheckedUpdateWithoutWaterfallTiersInput>
    create: XOR<PFTrancheCreateWithoutWaterfallTiersInput, PFTrancheUncheckedCreateWithoutWaterfallTiersInput>
    where?: PFTrancheWhereInput
  }

  export type PFTrancheUpdateToOneWithWhereWithoutWaterfallTiersInput = {
    where?: PFTrancheWhereInput
    data: XOR<PFTrancheUpdateWithoutWaterfallTiersInput, PFTrancheUncheckedUpdateWithoutWaterfallTiersInput>
  }

  export type PFTrancheUpdateWithoutWaterfallTiersInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: EnumTrancheTypeFieldUpdateOperationsInput | $Enums.TrancheType
    priority?: IntFieldUpdateOperationsInput | number
    targetAmount?: IntFieldUpdateOperationsInput | number
    raisedAmount?: IntFieldUpdateOperationsInput | number
    interestRate?: NullableFloatFieldUpdateOperationsInput | number | null
    targetReturn?: NullableFloatFieldUpdateOperationsInput | number | null
    termMonths?: NullableIntFieldUpdateOperationsInput | number | null
    status?: EnumTrancheStatusFieldUpdateOperationsInput | $Enums.TrancheStatus
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    spc?: SPCUpdateOneRequiredWithoutTranchesNestedInput
    investors?: PFTrancheInvestorUpdateManyWithoutTrancheNestedInput
  }

  export type PFTrancheUncheckedUpdateWithoutWaterfallTiersInput = {
    id?: StringFieldUpdateOperationsInput | string
    spcId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: EnumTrancheTypeFieldUpdateOperationsInput | $Enums.TrancheType
    priority?: IntFieldUpdateOperationsInput | number
    targetAmount?: IntFieldUpdateOperationsInput | number
    raisedAmount?: IntFieldUpdateOperationsInput | number
    interestRate?: NullableFloatFieldUpdateOperationsInput | number | null
    targetReturn?: NullableFloatFieldUpdateOperationsInput | number | null
    termMonths?: NullableIntFieldUpdateOperationsInput | number | null
    status?: EnumTrancheStatusFieldUpdateOperationsInput | $Enums.TrancheStatus
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    investors?: PFTrancheInvestorUncheckedUpdateManyWithoutTrancheNestedInput
  }

  export type SPCCreateWithoutRevenueEventsInput = {
    id?: string
    name: string
    legalType?: $Enums.SPCLegalType
    registrationNumber?: string | null
    incorporationDate?: string | null
    totalCapital?: number | null
    totalBudget?: number | null
    raisedAmount?: number
    status?: $Enums.SPCStatus
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    project: FilmProjectCreateNestedOneWithoutSpcsInput
    tranches?: PFTrancheCreateNestedManyWithoutSpcInput
    waterfallTiers?: WaterfallTierCreateNestedManyWithoutSpcInput
  }

  export type SPCUncheckedCreateWithoutRevenueEventsInput = {
    id?: string
    projectId: string
    name: string
    legalType?: $Enums.SPCLegalType
    registrationNumber?: string | null
    incorporationDate?: string | null
    totalCapital?: number | null
    totalBudget?: number | null
    raisedAmount?: number
    status?: $Enums.SPCStatus
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    tranches?: PFTrancheUncheckedCreateNestedManyWithoutSpcInput
    waterfallTiers?: WaterfallTierUncheckedCreateNestedManyWithoutSpcInput
  }

  export type SPCCreateOrConnectWithoutRevenueEventsInput = {
    where: SPCWhereUniqueInput
    create: XOR<SPCCreateWithoutRevenueEventsInput, SPCUncheckedCreateWithoutRevenueEventsInput>
  }

  export type WaterfallDistributionCreateWithoutEventInput = {
    id?: string
    tierId: string
    tierName: string
    tierPriority: number
    allocatedAmount: number
    cumulativePaid: number
    isFullySatisfied?: boolean
    calculatedAt?: Date | string
  }

  export type WaterfallDistributionUncheckedCreateWithoutEventInput = {
    id?: string
    tierId: string
    tierName: string
    tierPriority: number
    allocatedAmount: number
    cumulativePaid: number
    isFullySatisfied?: boolean
    calculatedAt?: Date | string
  }

  export type WaterfallDistributionCreateOrConnectWithoutEventInput = {
    where: WaterfallDistributionWhereUniqueInput
    create: XOR<WaterfallDistributionCreateWithoutEventInput, WaterfallDistributionUncheckedCreateWithoutEventInput>
  }

  export type WaterfallDistributionCreateManyEventInputEnvelope = {
    data: WaterfallDistributionCreateManyEventInput | WaterfallDistributionCreateManyEventInput[]
  }

  export type SPCUpsertWithoutRevenueEventsInput = {
    update: XOR<SPCUpdateWithoutRevenueEventsInput, SPCUncheckedUpdateWithoutRevenueEventsInput>
    create: XOR<SPCCreateWithoutRevenueEventsInput, SPCUncheckedCreateWithoutRevenueEventsInput>
    where?: SPCWhereInput
  }

  export type SPCUpdateToOneWithWhereWithoutRevenueEventsInput = {
    where?: SPCWhereInput
    data: XOR<SPCUpdateWithoutRevenueEventsInput, SPCUncheckedUpdateWithoutRevenueEventsInput>
  }

  export type SPCUpdateWithoutRevenueEventsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    legalType?: EnumSPCLegalTypeFieldUpdateOperationsInput | $Enums.SPCLegalType
    registrationNumber?: NullableStringFieldUpdateOperationsInput | string | null
    incorporationDate?: NullableStringFieldUpdateOperationsInput | string | null
    totalCapital?: NullableIntFieldUpdateOperationsInput | number | null
    totalBudget?: NullableIntFieldUpdateOperationsInput | number | null
    raisedAmount?: IntFieldUpdateOperationsInput | number
    status?: EnumSPCStatusFieldUpdateOperationsInput | $Enums.SPCStatus
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    project?: FilmProjectUpdateOneRequiredWithoutSpcsNestedInput
    tranches?: PFTrancheUpdateManyWithoutSpcNestedInput
    waterfallTiers?: WaterfallTierUpdateManyWithoutSpcNestedInput
  }

  export type SPCUncheckedUpdateWithoutRevenueEventsInput = {
    id?: StringFieldUpdateOperationsInput | string
    projectId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    legalType?: EnumSPCLegalTypeFieldUpdateOperationsInput | $Enums.SPCLegalType
    registrationNumber?: NullableStringFieldUpdateOperationsInput | string | null
    incorporationDate?: NullableStringFieldUpdateOperationsInput | string | null
    totalCapital?: NullableIntFieldUpdateOperationsInput | number | null
    totalBudget?: NullableIntFieldUpdateOperationsInput | number | null
    raisedAmount?: IntFieldUpdateOperationsInput | number
    status?: EnumSPCStatusFieldUpdateOperationsInput | $Enums.SPCStatus
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tranches?: PFTrancheUncheckedUpdateManyWithoutSpcNestedInput
    waterfallTiers?: WaterfallTierUncheckedUpdateManyWithoutSpcNestedInput
  }

  export type WaterfallDistributionUpsertWithWhereUniqueWithoutEventInput = {
    where: WaterfallDistributionWhereUniqueInput
    update: XOR<WaterfallDistributionUpdateWithoutEventInput, WaterfallDistributionUncheckedUpdateWithoutEventInput>
    create: XOR<WaterfallDistributionCreateWithoutEventInput, WaterfallDistributionUncheckedCreateWithoutEventInput>
  }

  export type WaterfallDistributionUpdateWithWhereUniqueWithoutEventInput = {
    where: WaterfallDistributionWhereUniqueInput
    data: XOR<WaterfallDistributionUpdateWithoutEventInput, WaterfallDistributionUncheckedUpdateWithoutEventInput>
  }

  export type WaterfallDistributionUpdateManyWithWhereWithoutEventInput = {
    where: WaterfallDistributionScalarWhereInput
    data: XOR<WaterfallDistributionUpdateManyMutationInput, WaterfallDistributionUncheckedUpdateManyWithoutEventInput>
  }

  export type WaterfallDistributionScalarWhereInput = {
    AND?: WaterfallDistributionScalarWhereInput | WaterfallDistributionScalarWhereInput[]
    OR?: WaterfallDistributionScalarWhereInput[]
    NOT?: WaterfallDistributionScalarWhereInput | WaterfallDistributionScalarWhereInput[]
    id?: StringFilter<"WaterfallDistribution"> | string
    eventId?: StringFilter<"WaterfallDistribution"> | string
    tierId?: StringFilter<"WaterfallDistribution"> | string
    tierName?: StringFilter<"WaterfallDistribution"> | string
    tierPriority?: IntFilter<"WaterfallDistribution"> | number
    allocatedAmount?: IntFilter<"WaterfallDistribution"> | number
    cumulativePaid?: IntFilter<"WaterfallDistribution"> | number
    isFullySatisfied?: BoolFilter<"WaterfallDistribution"> | boolean
    calculatedAt?: DateTimeFilter<"WaterfallDistribution"> | Date | string
  }

  export type RevenueEventCreateWithoutDistributionsInput = {
    id?: string
    amount: number
    source: $Enums.RevenueSource
    eventDate: string
    notes?: string | null
    distributionStatus?: string
    createdAt?: Date | string
    spc: SPCCreateNestedOneWithoutRevenueEventsInput
  }

  export type RevenueEventUncheckedCreateWithoutDistributionsInput = {
    id?: string
    spcId: string
    amount: number
    source: $Enums.RevenueSource
    eventDate: string
    notes?: string | null
    distributionStatus?: string
    createdAt?: Date | string
  }

  export type RevenueEventCreateOrConnectWithoutDistributionsInput = {
    where: RevenueEventWhereUniqueInput
    create: XOR<RevenueEventCreateWithoutDistributionsInput, RevenueEventUncheckedCreateWithoutDistributionsInput>
  }

  export type RevenueEventUpsertWithoutDistributionsInput = {
    update: XOR<RevenueEventUpdateWithoutDistributionsInput, RevenueEventUncheckedUpdateWithoutDistributionsInput>
    create: XOR<RevenueEventCreateWithoutDistributionsInput, RevenueEventUncheckedCreateWithoutDistributionsInput>
    where?: RevenueEventWhereInput
  }

  export type RevenueEventUpdateToOneWithWhereWithoutDistributionsInput = {
    where?: RevenueEventWhereInput
    data: XOR<RevenueEventUpdateWithoutDistributionsInput, RevenueEventUncheckedUpdateWithoutDistributionsInput>
  }

  export type RevenueEventUpdateWithoutDistributionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    amount?: IntFieldUpdateOperationsInput | number
    source?: EnumRevenueSourceFieldUpdateOperationsInput | $Enums.RevenueSource
    eventDate?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    distributionStatus?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    spc?: SPCUpdateOneRequiredWithoutRevenueEventsNestedInput
  }

  export type RevenueEventUncheckedUpdateWithoutDistributionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    spcId?: StringFieldUpdateOperationsInput | string
    amount?: IntFieldUpdateOperationsInput | number
    source?: EnumRevenueSourceFieldUpdateOperationsInput | $Enums.RevenueSource
    eventDate?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    distributionStatus?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InvestorGroupMemberCreateManyInvestorInput = {
    id?: string
    groupId: string
    commitment?: number | null
    role?: string
    joinedAt?: Date | string
  }

  export type PFTrancheInvestorCreateManyInvestorInput = {
    id?: string
    trancheId: string
    amount: number
    percentage?: number | null
    joinedAt?: Date | string
    notes?: string | null
  }

  export type InvestorGroupMemberUpdateWithoutInvestorInput = {
    id?: StringFieldUpdateOperationsInput | string
    commitment?: NullableIntFieldUpdateOperationsInput | number | null
    role?: StringFieldUpdateOperationsInput | string
    joinedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    group?: InvestorGroupUpdateOneRequiredWithoutMembersNestedInput
  }

  export type InvestorGroupMemberUncheckedUpdateWithoutInvestorInput = {
    id?: StringFieldUpdateOperationsInput | string
    groupId?: StringFieldUpdateOperationsInput | string
    commitment?: NullableIntFieldUpdateOperationsInput | number | null
    role?: StringFieldUpdateOperationsInput | string
    joinedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InvestorGroupMemberUncheckedUpdateManyWithoutInvestorInput = {
    id?: StringFieldUpdateOperationsInput | string
    groupId?: StringFieldUpdateOperationsInput | string
    commitment?: NullableIntFieldUpdateOperationsInput | number | null
    role?: StringFieldUpdateOperationsInput | string
    joinedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PFTrancheInvestorUpdateWithoutInvestorInput = {
    id?: StringFieldUpdateOperationsInput | string
    amount?: IntFieldUpdateOperationsInput | number
    percentage?: NullableFloatFieldUpdateOperationsInput | number | null
    joinedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    tranche?: PFTrancheUpdateOneRequiredWithoutInvestorsNestedInput
  }

  export type PFTrancheInvestorUncheckedUpdateWithoutInvestorInput = {
    id?: StringFieldUpdateOperationsInput | string
    trancheId?: StringFieldUpdateOperationsInput | string
    amount?: IntFieldUpdateOperationsInput | number
    percentage?: NullableFloatFieldUpdateOperationsInput | number | null
    joinedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type PFTrancheInvestorUncheckedUpdateManyWithoutInvestorInput = {
    id?: StringFieldUpdateOperationsInput | string
    trancheId?: StringFieldUpdateOperationsInput | string
    amount?: IntFieldUpdateOperationsInput | number
    percentage?: NullableFloatFieldUpdateOperationsInput | number | null
    joinedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type InvestorGroupMemberCreateManyGroupInput = {
    id?: string
    investorId: string
    commitment?: number | null
    role?: string
    joinedAt?: Date | string
  }

  export type InvestorGroupMemberUpdateWithoutGroupInput = {
    id?: StringFieldUpdateOperationsInput | string
    commitment?: NullableIntFieldUpdateOperationsInput | number | null
    role?: StringFieldUpdateOperationsInput | string
    joinedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    investor?: InvestorUpdateOneRequiredWithoutGroupMembershipsNestedInput
  }

  export type InvestorGroupMemberUncheckedUpdateWithoutGroupInput = {
    id?: StringFieldUpdateOperationsInput | string
    investorId?: StringFieldUpdateOperationsInput | string
    commitment?: NullableIntFieldUpdateOperationsInput | number | null
    role?: StringFieldUpdateOperationsInput | string
    joinedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InvestorGroupMemberUncheckedUpdateManyWithoutGroupInput = {
    id?: StringFieldUpdateOperationsInput | string
    investorId?: StringFieldUpdateOperationsInput | string
    commitment?: NullableIntFieldUpdateOperationsInput | number | null
    role?: StringFieldUpdateOperationsInput | string
    joinedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SPCCreateManyProjectInput = {
    id?: string
    name: string
    legalType?: $Enums.SPCLegalType
    registrationNumber?: string | null
    incorporationDate?: string | null
    totalCapital?: number | null
    totalBudget?: number | null
    raisedAmount?: number
    status?: $Enums.SPCStatus
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SPCUpdateWithoutProjectInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    legalType?: EnumSPCLegalTypeFieldUpdateOperationsInput | $Enums.SPCLegalType
    registrationNumber?: NullableStringFieldUpdateOperationsInput | string | null
    incorporationDate?: NullableStringFieldUpdateOperationsInput | string | null
    totalCapital?: NullableIntFieldUpdateOperationsInput | number | null
    totalBudget?: NullableIntFieldUpdateOperationsInput | number | null
    raisedAmount?: IntFieldUpdateOperationsInput | number
    status?: EnumSPCStatusFieldUpdateOperationsInput | $Enums.SPCStatus
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tranches?: PFTrancheUpdateManyWithoutSpcNestedInput
    waterfallTiers?: WaterfallTierUpdateManyWithoutSpcNestedInput
    revenueEvents?: RevenueEventUpdateManyWithoutSpcNestedInput
  }

  export type SPCUncheckedUpdateWithoutProjectInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    legalType?: EnumSPCLegalTypeFieldUpdateOperationsInput | $Enums.SPCLegalType
    registrationNumber?: NullableStringFieldUpdateOperationsInput | string | null
    incorporationDate?: NullableStringFieldUpdateOperationsInput | string | null
    totalCapital?: NullableIntFieldUpdateOperationsInput | number | null
    totalBudget?: NullableIntFieldUpdateOperationsInput | number | null
    raisedAmount?: IntFieldUpdateOperationsInput | number
    status?: EnumSPCStatusFieldUpdateOperationsInput | $Enums.SPCStatus
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tranches?: PFTrancheUncheckedUpdateManyWithoutSpcNestedInput
    waterfallTiers?: WaterfallTierUncheckedUpdateManyWithoutSpcNestedInput
    revenueEvents?: RevenueEventUncheckedUpdateManyWithoutSpcNestedInput
  }

  export type SPCUncheckedUpdateManyWithoutProjectInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    legalType?: EnumSPCLegalTypeFieldUpdateOperationsInput | $Enums.SPCLegalType
    registrationNumber?: NullableStringFieldUpdateOperationsInput | string | null
    incorporationDate?: NullableStringFieldUpdateOperationsInput | string | null
    totalCapital?: NullableIntFieldUpdateOperationsInput | number | null
    totalBudget?: NullableIntFieldUpdateOperationsInput | number | null
    raisedAmount?: IntFieldUpdateOperationsInput | number
    status?: EnumSPCStatusFieldUpdateOperationsInput | $Enums.SPCStatus
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PFTrancheCreateManySpcInput = {
    id?: string
    name: string
    type: $Enums.TrancheType
    priority: number
    targetAmount: number
    raisedAmount?: number
    interestRate?: number | null
    targetReturn?: number | null
    termMonths?: number | null
    status?: $Enums.TrancheStatus
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type WaterfallTierCreateManySpcInput = {
    id?: string
    priority: number
    name: string
    type: $Enums.TierType
    trancheId?: string | null
    amountCap?: number | null
    percentage?: number | null
    multiplier?: number | null
    description?: string | null
  }

  export type RevenueEventCreateManySpcInput = {
    id?: string
    amount: number
    source: $Enums.RevenueSource
    eventDate: string
    notes?: string | null
    distributionStatus?: string
    createdAt?: Date | string
  }

  export type PFTrancheUpdateWithoutSpcInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: EnumTrancheTypeFieldUpdateOperationsInput | $Enums.TrancheType
    priority?: IntFieldUpdateOperationsInput | number
    targetAmount?: IntFieldUpdateOperationsInput | number
    raisedAmount?: IntFieldUpdateOperationsInput | number
    interestRate?: NullableFloatFieldUpdateOperationsInput | number | null
    targetReturn?: NullableFloatFieldUpdateOperationsInput | number | null
    termMonths?: NullableIntFieldUpdateOperationsInput | number | null
    status?: EnumTrancheStatusFieldUpdateOperationsInput | $Enums.TrancheStatus
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    investors?: PFTrancheInvestorUpdateManyWithoutTrancheNestedInput
    waterfallTiers?: WaterfallTierUpdateManyWithoutTrancheNestedInput
  }

  export type PFTrancheUncheckedUpdateWithoutSpcInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: EnumTrancheTypeFieldUpdateOperationsInput | $Enums.TrancheType
    priority?: IntFieldUpdateOperationsInput | number
    targetAmount?: IntFieldUpdateOperationsInput | number
    raisedAmount?: IntFieldUpdateOperationsInput | number
    interestRate?: NullableFloatFieldUpdateOperationsInput | number | null
    targetReturn?: NullableFloatFieldUpdateOperationsInput | number | null
    termMonths?: NullableIntFieldUpdateOperationsInput | number | null
    status?: EnumTrancheStatusFieldUpdateOperationsInput | $Enums.TrancheStatus
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    investors?: PFTrancheInvestorUncheckedUpdateManyWithoutTrancheNestedInput
    waterfallTiers?: WaterfallTierUncheckedUpdateManyWithoutTrancheNestedInput
  }

  export type PFTrancheUncheckedUpdateManyWithoutSpcInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: EnumTrancheTypeFieldUpdateOperationsInput | $Enums.TrancheType
    priority?: IntFieldUpdateOperationsInput | number
    targetAmount?: IntFieldUpdateOperationsInput | number
    raisedAmount?: IntFieldUpdateOperationsInput | number
    interestRate?: NullableFloatFieldUpdateOperationsInput | number | null
    targetReturn?: NullableFloatFieldUpdateOperationsInput | number | null
    termMonths?: NullableIntFieldUpdateOperationsInput | number | null
    status?: EnumTrancheStatusFieldUpdateOperationsInput | $Enums.TrancheStatus
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WaterfallTierUpdateWithoutSpcInput = {
    id?: StringFieldUpdateOperationsInput | string
    priority?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    type?: EnumTierTypeFieldUpdateOperationsInput | $Enums.TierType
    amountCap?: NullableIntFieldUpdateOperationsInput | number | null
    percentage?: NullableFloatFieldUpdateOperationsInput | number | null
    multiplier?: NullableFloatFieldUpdateOperationsInput | number | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    tranche?: PFTrancheUpdateOneWithoutWaterfallTiersNestedInput
  }

  export type WaterfallTierUncheckedUpdateWithoutSpcInput = {
    id?: StringFieldUpdateOperationsInput | string
    priority?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    type?: EnumTierTypeFieldUpdateOperationsInput | $Enums.TierType
    trancheId?: NullableStringFieldUpdateOperationsInput | string | null
    amountCap?: NullableIntFieldUpdateOperationsInput | number | null
    percentage?: NullableFloatFieldUpdateOperationsInput | number | null
    multiplier?: NullableFloatFieldUpdateOperationsInput | number | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type WaterfallTierUncheckedUpdateManyWithoutSpcInput = {
    id?: StringFieldUpdateOperationsInput | string
    priority?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    type?: EnumTierTypeFieldUpdateOperationsInput | $Enums.TierType
    trancheId?: NullableStringFieldUpdateOperationsInput | string | null
    amountCap?: NullableIntFieldUpdateOperationsInput | number | null
    percentage?: NullableFloatFieldUpdateOperationsInput | number | null
    multiplier?: NullableFloatFieldUpdateOperationsInput | number | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type RevenueEventUpdateWithoutSpcInput = {
    id?: StringFieldUpdateOperationsInput | string
    amount?: IntFieldUpdateOperationsInput | number
    source?: EnumRevenueSourceFieldUpdateOperationsInput | $Enums.RevenueSource
    eventDate?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    distributionStatus?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    distributions?: WaterfallDistributionUpdateManyWithoutEventNestedInput
  }

  export type RevenueEventUncheckedUpdateWithoutSpcInput = {
    id?: StringFieldUpdateOperationsInput | string
    amount?: IntFieldUpdateOperationsInput | number
    source?: EnumRevenueSourceFieldUpdateOperationsInput | $Enums.RevenueSource
    eventDate?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    distributionStatus?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    distributions?: WaterfallDistributionUncheckedUpdateManyWithoutEventNestedInput
  }

  export type RevenueEventUncheckedUpdateManyWithoutSpcInput = {
    id?: StringFieldUpdateOperationsInput | string
    amount?: IntFieldUpdateOperationsInput | number
    source?: EnumRevenueSourceFieldUpdateOperationsInput | $Enums.RevenueSource
    eventDate?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    distributionStatus?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PFTrancheInvestorCreateManyTrancheInput = {
    id?: string
    investorId: string
    amount: number
    percentage?: number | null
    joinedAt?: Date | string
    notes?: string | null
  }

  export type WaterfallTierCreateManyTrancheInput = {
    id?: string
    spcId: string
    priority: number
    name: string
    type: $Enums.TierType
    amountCap?: number | null
    percentage?: number | null
    multiplier?: number | null
    description?: string | null
  }

  export type PFTrancheInvestorUpdateWithoutTrancheInput = {
    id?: StringFieldUpdateOperationsInput | string
    amount?: IntFieldUpdateOperationsInput | number
    percentage?: NullableFloatFieldUpdateOperationsInput | number | null
    joinedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    investor?: InvestorUpdateOneRequiredWithoutTranchePositionsNestedInput
  }

  export type PFTrancheInvestorUncheckedUpdateWithoutTrancheInput = {
    id?: StringFieldUpdateOperationsInput | string
    investorId?: StringFieldUpdateOperationsInput | string
    amount?: IntFieldUpdateOperationsInput | number
    percentage?: NullableFloatFieldUpdateOperationsInput | number | null
    joinedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type PFTrancheInvestorUncheckedUpdateManyWithoutTrancheInput = {
    id?: StringFieldUpdateOperationsInput | string
    investorId?: StringFieldUpdateOperationsInput | string
    amount?: IntFieldUpdateOperationsInput | number
    percentage?: NullableFloatFieldUpdateOperationsInput | number | null
    joinedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type WaterfallTierUpdateWithoutTrancheInput = {
    id?: StringFieldUpdateOperationsInput | string
    priority?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    type?: EnumTierTypeFieldUpdateOperationsInput | $Enums.TierType
    amountCap?: NullableIntFieldUpdateOperationsInput | number | null
    percentage?: NullableFloatFieldUpdateOperationsInput | number | null
    multiplier?: NullableFloatFieldUpdateOperationsInput | number | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    spc?: SPCUpdateOneRequiredWithoutWaterfallTiersNestedInput
  }

  export type WaterfallTierUncheckedUpdateWithoutTrancheInput = {
    id?: StringFieldUpdateOperationsInput | string
    spcId?: StringFieldUpdateOperationsInput | string
    priority?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    type?: EnumTierTypeFieldUpdateOperationsInput | $Enums.TierType
    amountCap?: NullableIntFieldUpdateOperationsInput | number | null
    percentage?: NullableFloatFieldUpdateOperationsInput | number | null
    multiplier?: NullableFloatFieldUpdateOperationsInput | number | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type WaterfallTierUncheckedUpdateManyWithoutTrancheInput = {
    id?: StringFieldUpdateOperationsInput | string
    spcId?: StringFieldUpdateOperationsInput | string
    priority?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    type?: EnumTierTypeFieldUpdateOperationsInput | $Enums.TierType
    amountCap?: NullableIntFieldUpdateOperationsInput | number | null
    percentage?: NullableFloatFieldUpdateOperationsInput | number | null
    multiplier?: NullableFloatFieldUpdateOperationsInput | number | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type WaterfallDistributionCreateManyEventInput = {
    id?: string
    tierId: string
    tierName: string
    tierPriority: number
    allocatedAmount: number
    cumulativePaid: number
    isFullySatisfied?: boolean
    calculatedAt?: Date | string
  }

  export type WaterfallDistributionUpdateWithoutEventInput = {
    id?: StringFieldUpdateOperationsInput | string
    tierId?: StringFieldUpdateOperationsInput | string
    tierName?: StringFieldUpdateOperationsInput | string
    tierPriority?: IntFieldUpdateOperationsInput | number
    allocatedAmount?: IntFieldUpdateOperationsInput | number
    cumulativePaid?: IntFieldUpdateOperationsInput | number
    isFullySatisfied?: BoolFieldUpdateOperationsInput | boolean
    calculatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WaterfallDistributionUncheckedUpdateWithoutEventInput = {
    id?: StringFieldUpdateOperationsInput | string
    tierId?: StringFieldUpdateOperationsInput | string
    tierName?: StringFieldUpdateOperationsInput | string
    tierPriority?: IntFieldUpdateOperationsInput | number
    allocatedAmount?: IntFieldUpdateOperationsInput | number
    cumulativePaid?: IntFieldUpdateOperationsInput | number
    isFullySatisfied?: BoolFieldUpdateOperationsInput | boolean
    calculatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WaterfallDistributionUncheckedUpdateManyWithoutEventInput = {
    id?: StringFieldUpdateOperationsInput | string
    tierId?: StringFieldUpdateOperationsInput | string
    tierName?: StringFieldUpdateOperationsInput | string
    tierPriority?: IntFieldUpdateOperationsInput | number
    allocatedAmount?: IntFieldUpdateOperationsInput | number
    cumulativePaid?: IntFieldUpdateOperationsInput | number
    isFullySatisfied?: BoolFieldUpdateOperationsInput | boolean
    calculatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}