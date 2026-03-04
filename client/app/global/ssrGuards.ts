import { getCookie } from "@g/cookies"

const ADMIN_COOKIE_KEY = "Admins"

type SSRContext = {
  req: any
}

type RedirectResult = {
  redirect: {
    destination: string
    permanent: boolean
  }
}

type PropsResult<TProps extends Record<string, any>> = {
  props: TProps
}

export function requireAdminSession<TProps extends Record<string, any>>(
  ctx: SSRContext,
  getProps?: (adminEmail: string) => Promise<TProps> | TProps,
): Promise<RedirectResult | PropsResult<TProps & { data: string }>> | RedirectResult | PropsResult<TProps & { data: string }> {
  const adminCookie = getCookie(ADMIN_COOKIE_KEY, ctx.req)

  if (!adminCookie) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    }
  }

  const baseProps = { data: adminCookie } as { data: string }

  if (!getProps) {
    return {
      props: baseProps as TProps & { data: string },
    }
  }

  const maybePromise = getProps(adminCookie)

  if (maybePromise && typeof (maybePromise as any).then === "function") {
    return (maybePromise as Promise<TProps>).then((extraProps) => ({
      props: {
        ...(extraProps as TProps),
        ...baseProps,
      },
    }))
  }

  return {
    props: {
      ...((maybePromise as TProps) || ({} as TProps)),
      ...baseProps,
    },
  }
}
