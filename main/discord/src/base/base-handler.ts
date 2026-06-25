export interface BaseHandler<TContext, TResult = void> {
    readonly kind: string;
    handle(ctx: TContext): Promise<TResult>;
}
