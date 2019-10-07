let ep = Element.prototype;
ep.matches =
  ep.matches ||
  ep.webkitMatchesSelector ||
  ep.msMatchesSelector ||
  ep.mozMatchesSelector;

export function closest(elem, selector) {
  while (elem !== document.body) {
    elem = elem.parentElement;
    if (elem.matches(selector)) return elem;
  }
}

let paramRe = /^:(.+)/;

function segmentize(uri) {
  return uri.replace(/(^\/+|\/+$)/g, "").split("/");
}

export function matchPath(routes, uri) {
  let match;
  const [uriPathname] = uri.split("?");
  const uriSegments = segmentize(uriPathname);
  const isRootUri = uriSegments[0] === "/";
  for (let i = 0; i < routes.length; i++) {
    const route = routes[i];
    const routeSegments = segmentize(route.path);
    const max = Math.max(uriSegments.length, routeSegments.length);
    let index = 0;
    let missed = false;
    let params = {};
    for (; index < max; index++) {
      const uriSegment = uriSegments[index];
      const routeSegment = routeSegments[index];
      const isSplat = routeSegment === "*";

      if (isSplat) {
        params["*"] = uriSegments
          .slice(index)
          .map(decodeURIComponent)
          .join("/");
        break;
      }

      if (uriSegment === undefined) {
        missed = true;
        break;
      }

      let dynamicMatch = paramRe.exec(routeSegment);

      if (dynamicMatch && !isRootUri) {
        let value = decodeURIComponent(uriSegment);
        params[dynamicMatch[1]] = value;
      } else if (routeSegment !== uriSegment) {
        missed = true;
        break;
      }
    }

    if (!missed) {
      match = {
        params,
        ...route
      };
      break;
    }
  }

  return match || null;
}