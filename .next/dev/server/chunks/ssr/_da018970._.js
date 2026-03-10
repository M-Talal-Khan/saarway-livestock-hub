module.exports = [
"[project]/src/hooks/useScrollAnimation.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useCountUp",
    ()=>useCountUp,
    "useScrollAnimation",
    ()=>useScrollAnimation
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
;
const useScrollAnimation = (threshold = 0.1)=>{
    const ref = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [isVisible, setIsVisible] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const observer = new IntersectionObserver(([entry])=>{
            if (entry.isIntersecting) {
                setIsVisible(true);
                observer.unobserve(entry.target);
            }
        }, {
            threshold
        });
        if (ref.current) observer.observe(ref.current);
        return ()=>observer.disconnect();
    }, [
        threshold
    ]);
    return {
        ref,
        isVisible
    };
};
const useCountUp = (target, duration = 1500, isVisible = false)=>{
    const [count, setCount] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!isVisible) return;
        let start = 0;
        const increment = target / (duration / 16);
        const timer = setInterval(()=>{
            start += increment;
            if (start >= target) {
                setCount(target);
                clearInterval(timer);
            } else {
                setCount(Math.floor(start));
            }
        }, 16);
        return ()=>clearInterval(timer);
    }, [
        target,
        duration,
        isVisible
    ]);
    return count;
};
}),
"[project]/src/views/Home.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/image.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$factory$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Factory$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/factory.js [app-ssr] (ecmascript) <export default as Factory>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$beef$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Beef$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/beef.js [app-ssr] (ecmascript) <export default as Beef>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/map-pin.js [app-ssr] (ecmascript) <export default as MapPin>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$dna$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Dna$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/dna.js [app-ssr] (ecmascript) <export default as Dna>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-right.js [app-ssr] (ecmascript) <export default as ArrowRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Lock$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/lock.js [app-ssr] (ecmascript) <export default as Lock>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$milk$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Milk$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/milk.js [app-ssr] (ecmascript) <export default as Milk>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$utensils$2d$crossed$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__UtensilsCrossed$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/utensils-crossed.js [app-ssr] (ecmascript) <export default as UtensilsCrossed>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-down.js [app-ssr] (ecmascript) <export default as ChevronDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useScrollAnimation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/useScrollAnimation.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$typewriter$2d$effect$2f$dist$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/typewriter-effect/dist/react.js [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
;
const StatCard = ({ icon: Icon, label, value, delay = 0 })=>{
    const { ref, isVisible } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useScrollAnimation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useScrollAnimation"])();
    const count = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useScrollAnimation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCountUp"])(value, 1500, isVisible);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: ref,
        className: `group relative rounded-2xl p-6 text-center transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_16px_40px_rgba(61,184,61,0.2)] border border-primary/15 bg-white/80 backdrop-blur-lg ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`,
        style: {
            transitionDelay: `${delay}ms`
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "w-14 h-14 mx-auto mb-3 rounded-full bg-gradient-to-br from-sw-green-100 to-sw-green-300/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                    className: "w-7 h-7 text-sw-green-700 sw-icon-premium"
                }, void 0, false, {
                    fileName: "[project]/src/views/Home.tsx",
                    lineNumber: 23,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/src/views/Home.tsx",
                lineNumber: 22,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-4xl font-extrabold text-sw-green-900",
                children: count
            }, void 0, false, {
                fileName: "[project]/src/views/Home.tsx",
                lineNumber: 25,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-sm text-muted-foreground mt-1 font-medium",
                children: label
            }, void 0, false, {
                fileName: "[project]/src/views/Home.tsx",
                lineNumber: 26,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/src/views/Home.tsx",
        lineNumber: 17,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
const AnimatedSection = ({ children, className = '', delay = 0 })=>{
    const { ref, isVisible } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useScrollAnimation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useScrollAnimation"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: ref,
        className: `transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`,
        style: {
            transitionDelay: `${delay}ms`
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/src/views/Home.tsx",
        lineNumber: 34,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
const Home = ()=>{
    const [currentSlide, setCurrentSlide] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [stats, setStats] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        farmCount: 0,
        animalCount: 0,
        cityCount: 0,
        breedCount: 0
    });
    const [featuredFarms, setFeaturedFarms] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const slides = [
        '/images/home_slider/slide1.webp',
        '/images/home_slider/slide2.webp',
        '/images/home_slider/slide3.webp'
    ];
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const timer = setInterval(()=>{
            setCurrentSlide((prev)=>(prev + 1) % slides.length);
        }, 6000);
        return ()=>clearInterval(timer);
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        fetch('/api/stats').then((r)=>r.json()).then((d)=>{
            if (d.farmCount !== undefined) setStats(d);
        }).catch(()=>{});
        fetch('/api/farms').then((r)=>r.json()).then((d)=>{
            setFeaturedFarms((d.farms ?? []).slice(0, 4));
        }).catch(()=>{});
    }, []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "min-h-screen relative flex items-center justify-center overflow-hidden bg-black",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute inset-0 w-full h-full",
                        children: slides.map((slide, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: `absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                    src: slide,
                                    alt: `Saarway Hero ${index + 1}`,
                                    fill: true,
                                    className: "object-cover",
                                    priority: index === 0,
                                    quality: 90
                                }, void 0, false, {
                                    fileName: "[project]/src/views/Home.tsx",
                                    lineNumber: 82,
                                    columnNumber: 15
                                }, ("TURBOPACK compile-time value", void 0))
                            }, slide, false, {
                                fileName: "[project]/src/views/Home.tsx",
                                lineNumber: 78,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)))
                    }, void 0, false, {
                        fileName: "[project]/src/views/Home.tsx",
                        lineNumber: 76,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/60 z-10"
                    }, void 0, false, {
                        fileName: "[project]/src/views/Home.tsx",
                        lineNumber: 95,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "container mx-auto px-4 pt-20 pb-16 relative z-20 flex flex-col items-center",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "max-w-4xl mx-auto text-center bg-black/30 backdrop-blur-sm border border-white/10 p-8 md:p-14 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mb-6 flex justify-center",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-lg",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                            src: "/images/logo-icon-v2.png",
                                            alt: "Saarway",
                                            width: 56,
                                            height: 56,
                                            className: "drop-shadow-md brightness-0 invert"
                                        }, void 0, false, {
                                            fileName: "[project]/src/views/Home.tsx",
                                            lineNumber: 104,
                                            columnNumber: 17
                                        }, ("TURBOPACK compile-time value", void 0))
                                    }, void 0, false, {
                                        fileName: "[project]/src/views/Home.tsx",
                                        lineNumber: 103,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0))
                                }, void 0, false, {
                                    fileName: "[project]/src/views/Home.tsx",
                                    lineNumber: 102,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                    className: "text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-[1.15] drop-shadow-md min-h-[140px] md:min-h-[160px] lg:min-h-[170px] flex items-center justify-center",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$typewriter$2d$effect$2f$dist$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                        options: {
                                            strings: [
                                                'Pakistan\'s First <span class="text-sw-green-400">Livestock ERP</span>',
                                                'Pakistan\'s First <span class="text-sw-green-400">Marketplace</span>',
                                                'Pakistan\'s First <span class="text-sw-gold-400">Digital Farm</span>'
                                            ],
                                            autoStart: true,
                                            loop: true,
                                            delay: 60,
                                            deleteSpeed: 30
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/src/views/Home.tsx",
                                        lineNumber: 115,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0))
                                }, void 0, false, {
                                    fileName: "[project]/src/views/Home.tsx",
                                    lineNumber: 114,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-lg md:text-xl text-white mb-10 font-bold max-w-2xl mx-auto drop-shadow-md leading-relaxed",
                                    children: "Manage your entire farm digitally. Track cattle, monitor health, handle finances, and connect with buyers directly — all seamlessly in one platform."
                                }, void 0, false, {
                                    fileName: "[project]/src/views/Home.tsx",
                                    lineNumber: 130,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-col sm:flex-row gap-5 justify-center mt-8",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                            href: "/marketplace",
                                            className: "group px-8 py-4 rounded-xl font-extrabold text-sw-green-950 bg-white hover:bg-sw-green-50 shadow-lg transition-all duration-300 flex items-center justify-center gap-2 sw-ripple",
                                            children: [
                                                "Explore Marketplace",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__["ArrowRight"], {
                                                    className: "w-5 h-5 group-hover:translate-x-1 transition-transform sw-icon-premium"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/views/Home.tsx",
                                                    lineNumber: 140,
                                                    columnNumber: 17
                                                }, ("TURBOPACK compile-time value", void 0))
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/views/Home.tsx",
                                            lineNumber: 135,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                            href: "/register-farm",
                                            style: {
                                                backgroundColor: '#16a34a'
                                            },
                                            className: "px-8 py-4 rounded-xl font-extrabold text-white hover:bg-[#15803d] shadow-[0_4px_14px_0_rgba(22,163,74,0.39)] hover:shadow-[0_6px_20px_rgba(22,163,74,0.23)] hover:-translate-y-0.5 transition-all duration-300 transform sw-ripple",
                                            children: "Register Your Farm"
                                        }, void 0, false, {
                                            fileName: "[project]/src/views/Home.tsx",
                                            lineNumber: 143,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/views/Home.tsx",
                                    lineNumber: 134,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/views/Home.tsx",
                            lineNumber: 100,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0))
                    }, void 0, false, {
                        fileName: "[project]/src/views/Home.tsx",
                        lineNumber: 98,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce text-white/80 z-20",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                            className: "w-8 h-8 drop-shadow-md"
                        }, void 0, false, {
                            fileName: "[project]/src/views/Home.tsx",
                            lineNumber: 156,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0))
                    }, void 0, false, {
                        fileName: "[project]/src/views/Home.tsx",
                        lineNumber: 155,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/src/views/Home.tsx",
                lineNumber: 74,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "py-20 bg-background relative border-t border-border",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "container mx-auto px-4",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 -mt-12 relative z-10",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(StatCard, {
                                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$factory$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Factory$3e$__["Factory"],
                                label: "Farms Onboarded",
                                value: stats.farmCount,
                                delay: 0
                            }, void 0, false, {
                                fileName: "[project]/src/views/Home.tsx",
                                lineNumber: 164,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(StatCard, {
                                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$beef$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Beef$3e$__["Beef"],
                                label: "Animals Listed",
                                value: stats.animalCount,
                                delay: 100
                            }, void 0, false, {
                                fileName: "[project]/src/views/Home.tsx",
                                lineNumber: 165,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(StatCard, {
                                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__["MapPin"],
                                label: "Cities Covered",
                                value: stats.cityCount,
                                delay: 200
                            }, void 0, false, {
                                fileName: "[project]/src/views/Home.tsx",
                                lineNumber: 166,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(StatCard, {
                                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$dna$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Dna$3e$__["Dna"],
                                label: "Breeds Available",
                                value: stats.breedCount,
                                delay: 300
                            }, void 0, false, {
                                fileName: "[project]/src/views/Home.tsx",
                                lineNumber: 167,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/views/Home.tsx",
                        lineNumber: 163,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0))
                }, void 0, false, {
                    fileName: "[project]/src/views/Home.tsx",
                    lineNumber: 162,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/src/views/Home.tsx",
                lineNumber: 161,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "py-24 bg-white",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "container mx-auto px-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(AnimatedSection, {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "text-3xl md:text-4xl font-extrabold text-center text-sw-green-950 mb-3 tracking-tight",
                                    children: "How It Works"
                                }, void 0, false, {
                                    fileName: "[project]/src/views/Home.tsx",
                                    lineNumber: 176,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-center text-sw-green-950/70 mb-6 max-w-lg mx-auto font-medium text-lg",
                                    children: "Digitising your farm in three simple steps"
                                }, void 0, false, {
                                    fileName: "[project]/src/views/Home.tsx",
                                    lineNumber: 177,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "w-20 h-1.5 bg-sw-green-500 rounded-full mx-auto mb-16"
                                }, void 0, false, {
                                    fileName: "[project]/src/views/Home.tsx",
                                    lineNumber: 178,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/views/Home.tsx",
                            lineNumber: 175,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid md:grid-cols-3 gap-8 max-w-4xl mx-auto relative",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "hidden md:block absolute top-[4.5rem] left-[15%] right-[15%] h-[2px] border-t-2 border-dashed border-sw-green-200"
                                }, void 0, false, {
                                    fileName: "[project]/src/views/Home.tsx",
                                    lineNumber: 181,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0)),
                                [
                                    {
                                        step: 1,
                                        title: 'Register Your Farm',
                                        desc: 'Secure your unique Farm ID and get access to your dedicated ERP workspace.'
                                    },
                                    {
                                        step: 2,
                                        title: 'Manage Inventory',
                                        desc: 'Add your cattle with photos, health records, and asking price.'
                                    },
                                    {
                                        step: 3,
                                        title: 'Connect with Buyers',
                                        desc: 'Publish listings publicly and let verified buyers contact you via WhatsApp.'
                                    }
                                ].map((item, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(AnimatedSection, {
                                        delay: i * 150,
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "sw-glass-hover-gradient rounded-3xl p-8 text-center h-full",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "w-16 h-16 rounded-2xl bg-sw-green-50 text-sw-green-600 flex items-center justify-center font-bold text-2xl mx-auto mb-6 shadow-sm border border-sw-green-100 relative z-10",
                                                    children: item.step
                                                }, void 0, false, {
                                                    fileName: "[project]/src/views/Home.tsx",
                                                    lineNumber: 190,
                                                    columnNumber: 19
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                    className: "text-xl font-bold text-sw-green-950 mb-3",
                                                    children: item.title
                                                }, void 0, false, {
                                                    fileName: "[project]/src/views/Home.tsx",
                                                    lineNumber: 193,
                                                    columnNumber: 19
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-base text-sw-green-950/70 leading-relaxed font-medium",
                                                    children: item.desc
                                                }, void 0, false, {
                                                    fileName: "[project]/src/views/Home.tsx",
                                                    lineNumber: 194,
                                                    columnNumber: 19
                                                }, ("TURBOPACK compile-time value", void 0))
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/views/Home.tsx",
                                            lineNumber: 189,
                                            columnNumber: 17
                                        }, ("TURBOPACK compile-time value", void 0))
                                    }, item.step, false, {
                                        fileName: "[project]/src/views/Home.tsx",
                                        lineNumber: 187,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/views/Home.tsx",
                            lineNumber: 180,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/views/Home.tsx",
                    lineNumber: 174,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/src/views/Home.tsx",
                lineNumber: 173,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "py-24 relative overflow-hidden bg-sw-green-50",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute inset-0 opacity-[0.03]",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                            className: "w-full h-full",
                            viewBox: "0 0 1440 800",
                            fill: "none",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("pattern", {
                                    id: "hexPatternTeaser",
                                    x: "0",
                                    y: "0",
                                    width: "60",
                                    height: "52",
                                    patternUnits: "userSpaceOnUse",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("polygon", {
                                        points: "30,0 60,15 60,37 30,52 0,37 0,15",
                                        fill: "none",
                                        stroke: "currentColor",
                                        strokeWidth: "1"
                                    }, void 0, false, {
                                        fileName: "[project]/src/views/Home.tsx",
                                        lineNumber: 207,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0))
                                }, void 0, false, {
                                    fileName: "[project]/src/views/Home.tsx",
                                    lineNumber: 206,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                                    width: "1440",
                                    height: "800",
                                    fill: "url(#hexPatternTeaser)"
                                }, void 0, false, {
                                    fileName: "[project]/src/views/Home.tsx",
                                    lineNumber: 209,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/views/Home.tsx",
                            lineNumber: 205,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0))
                    }, void 0, false, {
                        fileName: "[project]/src/views/Home.tsx",
                        lineNumber: 204,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "container mx-auto px-4 text-center max-w-3xl relative z-10",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(AnimatedSection, {
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "sw-glass-hover-gradient p-10 md:p-14 rounded-3xl text-center",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-sw-green-600 mb-6 flex justify-center",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$dna$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Dna$3e$__["Dna"], {
                                            className: "w-12 h-12"
                                        }, void 0, false, {
                                            fileName: "[project]/src/views/Home.tsx",
                                            lineNumber: 217,
                                            columnNumber: 17
                                        }, ("TURBOPACK compile-time value", void 0))
                                    }, void 0, false, {
                                        fileName: "[project]/src/views/Home.tsx",
                                        lineNumber: 216,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-2xl md:text-3xl text-sw-green-950 italic mb-10 leading-relaxed font-semibold",
                                        children: '"Saarway began as a university project with a simple question — what if a farmer in Kasur could list his cattle, and a buyer in Lahore could find him in seconds?"'
                                    }, void 0, false, {
                                        fileName: "[project]/src/views/Home.tsx",
                                        lineNumber: 219,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                        href: "/about",
                                        style: {
                                            backgroundColor: '#16a34a'
                                        },
                                        className: "inline-flex items-center justify-center gap-2 text-white font-extrabold px-8 py-4 rounded-xl hover:bg-[#15803d] shadow-md transition-all group sw-ripple",
                                        children: [
                                            "Read Our Story ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__["ArrowRight"], {
                                                className: "w-5 h-5 group-hover:translate-x-1 transition-transform sw-icon-premium"
                                            }, void 0, false, {
                                                fileName: "[project]/src/views/Home.tsx",
                                                lineNumber: 223,
                                                columnNumber: 32
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/views/Home.tsx",
                                        lineNumber: 222,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/views/Home.tsx",
                                lineNumber: 215,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0))
                        }, void 0, false, {
                            fileName: "[project]/src/views/Home.tsx",
                            lineNumber: 213,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0))
                    }, void 0, false, {
                        fileName: "[project]/src/views/Home.tsx",
                        lineNumber: 212,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/src/views/Home.tsx",
                lineNumber: 203,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "py-24 bg-white relative",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "container mx-auto px-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(AnimatedSection, {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "text-3xl md:text-4xl font-extrabold text-center text-sw-green-950 mb-3 tracking-tight",
                                    children: "Farms on Saarway"
                                }, void 0, false, {
                                    fileName: "[project]/src/views/Home.tsx",
                                    lineNumber: 234,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-center text-sw-green-950/70 mb-6 max-w-lg mx-auto font-medium text-lg",
                                    children: "Trusted farms from across Pakistan"
                                }, void 0, false, {
                                    fileName: "[project]/src/views/Home.tsx",
                                    lineNumber: 235,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "w-20 h-1.5 bg-sw-green-500 rounded-full mx-auto mb-16"
                                }, void 0, false, {
                                    fileName: "[project]/src/views/Home.tsx",
                                    lineNumber: 236,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/views/Home.tsx",
                            lineNumber: 233,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid sm:grid-cols-2 lg:grid-cols-4 gap-6",
                            children: featuredFarms.length === 0 ? [
                                0,
                                1,
                                2,
                                3
                            ].map((i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "sw-glass-hover-gradient rounded-3xl h-48 animate-pulse bg-sw-green-50"
                                }, i, false, {
                                    fileName: "[project]/src/views/Home.tsx",
                                    lineNumber: 241,
                                    columnNumber: 17
                                }, ("TURBOPACK compile-time value", void 0))) : featuredFarms.map((farm, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(AnimatedSection, {
                                    delay: i * 100,
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                        href: `/farms/${farm.id}`,
                                        className: "group block sw-glass-hover-gradient rounded-3xl overflow-hidden h-full",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "h-2 bg-gradient-to-r from-sw-green-400 to-sw-green-600 w-0 group-hover:w-full transition-all duration-500"
                                            }, void 0, false, {
                                                fileName: "[project]/src/views/Home.tsx",
                                                lineNumber: 246,
                                                columnNumber: 19
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "p-8",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                        className: "font-bold text-sw-green-950 text-xl mb-2",
                                                        children: farm.farm_name
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/views/Home.tsx",
                                                        lineNumber: 248,
                                                        columnNumber: 21
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-sm text-sw-green-700 font-semibold flex items-center gap-1.5 mb-4",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__["MapPin"], {
                                                                className: "w-4 h-4"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/views/Home.tsx",
                                                                lineNumber: 250,
                                                                columnNumber: 23
                                                            }, ("TURBOPACK compile-time value", void 0)),
                                                            " ",
                                                            farm.city
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/views/Home.tsx",
                                                        lineNumber: 249,
                                                        columnNumber: 21
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center justify-between pt-4 border-t border-black/5 mt-6",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "inline-flex text-xs font-bold bg-white/80 text-sw-green-700 px-3 py-1.5 rounded-lg border border-sw-green-200",
                                                                children: [
                                                                    farm.activeListings,
                                                                    " active listing",
                                                                    farm.activeListings !== 1 ? 's' : ''
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/views/Home.tsx",
                                                                lineNumber: 253,
                                                                columnNumber: 23
                                                            }, ("TURBOPACK compile-time value", void 0)),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__["ArrowRight"], {
                                                                className: "w-5 h-5 text-sw-green-400 group-hover:text-sw-green-700 group-hover:translate-x-1 transition-all"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/views/Home.tsx",
                                                                lineNumber: 256,
                                                                columnNumber: 23
                                                            }, ("TURBOPACK compile-time value", void 0))
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/views/Home.tsx",
                                                        lineNumber: 252,
                                                        columnNumber: 21
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/views/Home.tsx",
                                                lineNumber: 247,
                                                columnNumber: 19
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/views/Home.tsx",
                                        lineNumber: 245,
                                        columnNumber: 17
                                    }, ("TURBOPACK compile-time value", void 0))
                                }, farm.id, false, {
                                    fileName: "[project]/src/views/Home.tsx",
                                    lineNumber: 244,
                                    columnNumber: 15
                                }, ("TURBOPACK compile-time value", void 0)))
                        }, void 0, false, {
                            fileName: "[project]/src/views/Home.tsx",
                            lineNumber: 238,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-center mt-12",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                href: "/farms",
                                className: "inline-flex items-center justify-center gap-2 bg-white border-2 border-sw-green-600 text-sw-green-700 font-extrabold px-8 py-3 rounded-xl hover:bg-sw-green-50 hover:shadow-md transition-all group sw-ripple",
                                children: [
                                    "View All Farms ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__["ArrowRight"], {
                                        className: "w-5 h-5 group-hover:translate-x-1 transition-transform sw-icon-premium"
                                    }, void 0, false, {
                                        fileName: "[project]/src/views/Home.tsx",
                                        lineNumber: 265,
                                        columnNumber: 30
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/views/Home.tsx",
                                lineNumber: 264,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0))
                        }, void 0, false, {
                            fileName: "[project]/src/views/Home.tsx",
                            lineNumber: 263,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/views/Home.tsx",
                    lineNumber: 232,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/src/views/Home.tsx",
                lineNumber: 231,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "py-24 bg-sw-green-950 relative overflow-hidden text-white",
                style: {
                    background: 'linear-gradient(135deg, hsl(120 75% 15%), hsl(120 80% 8%))'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute top-0 right-0 w-[500px] h-[500px] bg-sw-green-500/10 blur-[100px] rounded-full"
                    }, void 0, false, {
                        fileName: "[project]/src/views/Home.tsx",
                        lineNumber: 274,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute bottom-0 left-0 w-[400px] h-[400px] bg-sw-gold-400/10 blur-[100px] rounded-full"
                    }, void 0, false, {
                        fileName: "[project]/src/views/Home.tsx",
                        lineNumber: 275,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "container mx-auto px-4 relative z-10",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(AnimatedSection, {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "text-3xl md:text-4xl font-extrabold text-center mb-3 tracking-tight text-white drop-shadow-md",
                                        children: "Coming Soon"
                                    }, void 0, false, {
                                        fileName: "[project]/src/views/Home.tsx",
                                        lineNumber: 280,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-center text-white/80 mb-6 max-w-lg mx-auto font-medium text-lg drop-shadow-sm",
                                        children: "New features currently in development"
                                    }, void 0, false, {
                                        fileName: "[project]/src/views/Home.tsx",
                                        lineNumber: 281,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "w-20 h-1.5 bg-sw-gold-400 rounded-full mx-auto mb-16 shadow-[0_0_10px_rgba(250,204,21,0.5)]"
                                    }, void 0, false, {
                                        fileName: "[project]/src/views/Home.tsx",
                                        lineNumber: 282,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/views/Home.tsx",
                                lineNumber: 278,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid md:grid-cols-2 gap-8 max-w-4xl mx-auto",
                                children: [
                                    {
                                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$milk$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Milk$3e$__["Milk"],
                                        title: 'Dairy Module',
                                        desc: 'Daily milk production tracking, per-cow yield reports, and dairy income integration.'
                                    },
                                    {
                                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$utensils$2d$crossed$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__UtensilsCrossed$3e$__["UtensilsCrossed"],
                                        title: 'Butchery Module',
                                        desc: 'Manage meat processing, custom packaging, specific cuts, and B2B meat sales.'
                                    }
                                ].map((mod, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(AnimatedSection, {
                                        delay: i * 150,
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "sw-glass-dark rounded-3xl p-8 relative overflow-hidden group hover:-translate-y-2 transition-transform duration-300",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "absolute top-4 right-4 flex items-center gap-1.5 text-xs bg-sw-gold-400 text-sw-green-950 px-3 py-1.5 rounded-full font-bold shadow-md",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Lock$3e$__["Lock"], {
                                                            className: "w-3.5 h-3.5"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/views/Home.tsx",
                                                            lineNumber: 293,
                                                            columnNumber: 21
                                                        }, ("TURBOPACK compile-time value", void 0)),
                                                        " Coming Soon"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/views/Home.tsx",
                                                    lineNumber: 292,
                                                    columnNumber: 19
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "relative z-10",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform duration-300",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(mod.icon, {
                                                                className: "w-7 h-7 text-sw-gold-400"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/views/Home.tsx",
                                                                lineNumber: 297,
                                                                columnNumber: 23
                                                            }, ("TURBOPACK compile-time value", void 0))
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/views/Home.tsx",
                                                            lineNumber: 296,
                                                            columnNumber: 21
                                                        }, ("TURBOPACK compile-time value", void 0)),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                            className: "text-2xl font-bold mb-3 text-white",
                                                            children: mod.title
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/views/Home.tsx",
                                                            lineNumber: 300,
                                                            columnNumber: 21
                                                        }, ("TURBOPACK compile-time value", void 0)),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-base text-white/80 leading-relaxed font-semibold",
                                                            children: mod.desc
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/views/Home.tsx",
                                                            lineNumber: 301,
                                                            columnNumber: 21
                                                        }, ("TURBOPACK compile-time value", void 0))
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/views/Home.tsx",
                                                    lineNumber: 295,
                                                    columnNumber: 19
                                                }, ("TURBOPACK compile-time value", void 0))
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/views/Home.tsx",
                                            lineNumber: 291,
                                            columnNumber: 17
                                        }, ("TURBOPACK compile-time value", void 0))
                                    }, mod.title, false, {
                                        fileName: "[project]/src/views/Home.tsx",
                                        lineNumber: 289,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)))
                            }, void 0, false, {
                                fileName: "[project]/src/views/Home.tsx",
                                lineNumber: 284,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/views/Home.tsx",
                        lineNumber: 277,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/src/views/Home.tsx",
                lineNumber: 273,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/src/views/Home.tsx",
        lineNumber: 72,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
const __TURBOPACK__default__export__ = Home;
}),
"[project]/node_modules/lucide-react/dist/esm/icons/beef.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Beef
]);
/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-ssr] (ecmascript)");
;
const Beef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])("Beef", [
    [
        "circle",
        {
            cx: "12.5",
            cy: "8.5",
            r: "2.5",
            key: "9738u8"
        }
    ],
    [
        "path",
        {
            d: "M12.5 2a6.5 6.5 0 0 0-6.22 4.6c-1.1 3.13-.78 3.9-3.18 6.08A3 3 0 0 0 5 18c4 0 8.4-1.8 11.4-4.3A6.5 6.5 0 0 0 12.5 2Z",
            key: "o0f6za"
        }
    ],
    [
        "path",
        {
            d: "m18.5 6 2.19 4.5a6.48 6.48 0 0 1 .31 2 6.49 6.49 0 0 1-2.6 5.2C15.4 20.2 11 22 7 22a3 3 0 0 1-2.68-1.66L2.4 16.5",
            key: "k7p6i0"
        }
    ]
]);
;
 //# sourceMappingURL=beef.js.map
}),
"[project]/node_modules/lucide-react/dist/esm/icons/beef.js [app-ssr] (ecmascript) <export default as Beef>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Beef",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$beef$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$beef$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/beef.js [app-ssr] (ecmascript)");
}),
"[project]/node_modules/lucide-react/dist/esm/icons/dna.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Dna
]);
/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-ssr] (ecmascript)");
;
const Dna = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])("Dna", [
    [
        "path",
        {
            d: "m10 16 1.5 1.5",
            key: "11lckj"
        }
    ],
    [
        "path",
        {
            d: "m14 8-1.5-1.5",
            key: "1ohn8i"
        }
    ],
    [
        "path",
        {
            d: "M15 2c-1.798 1.998-2.518 3.995-2.807 5.993",
            key: "80uv8i"
        }
    ],
    [
        "path",
        {
            d: "m16.5 10.5 1 1",
            key: "696xn5"
        }
    ],
    [
        "path",
        {
            d: "m17 6-2.891-2.891",
            key: "xu6p2f"
        }
    ],
    [
        "path",
        {
            d: "M2 15c6.667-6 13.333 0 20-6",
            key: "1pyr53"
        }
    ],
    [
        "path",
        {
            d: "m20 9 .891.891",
            key: "3xwk7g"
        }
    ],
    [
        "path",
        {
            d: "M3.109 14.109 4 15",
            key: "q76aoh"
        }
    ],
    [
        "path",
        {
            d: "m6.5 12.5 1 1",
            key: "cs35ky"
        }
    ],
    [
        "path",
        {
            d: "m7 18 2.891 2.891",
            key: "1sisit"
        }
    ],
    [
        "path",
        {
            d: "M9 22c1.798-1.998 2.518-3.995 2.807-5.993",
            key: "q3hbxp"
        }
    ]
]);
;
 //# sourceMappingURL=dna.js.map
}),
"[project]/node_modules/lucide-react/dist/esm/icons/dna.js [app-ssr] (ecmascript) <export default as Dna>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Dna",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$dna$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$dna$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/dna.js [app-ssr] (ecmascript)");
}),
"[project]/node_modules/lucide-react/dist/esm/icons/arrow-right.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ArrowRight
]);
/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-ssr] (ecmascript)");
;
const ArrowRight = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])("ArrowRight", [
    [
        "path",
        {
            d: "M5 12h14",
            key: "1ays0h"
        }
    ],
    [
        "path",
        {
            d: "m12 5 7 7-7 7",
            key: "xquz4c"
        }
    ]
]);
;
 //# sourceMappingURL=arrow-right.js.map
}),
"[project]/node_modules/lucide-react/dist/esm/icons/arrow-right.js [app-ssr] (ecmascript) <export default as ArrowRight>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ArrowRight",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-right.js [app-ssr] (ecmascript)");
}),
"[project]/node_modules/lucide-react/dist/esm/icons/lock.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Lock
]);
/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-ssr] (ecmascript)");
;
const Lock = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])("Lock", [
    [
        "rect",
        {
            width: "18",
            height: "11",
            x: "3",
            y: "11",
            rx: "2",
            ry: "2",
            key: "1w4ew1"
        }
    ],
    [
        "path",
        {
            d: "M7 11V7a5 5 0 0 1 10 0v4",
            key: "fwvmzm"
        }
    ]
]);
;
 //# sourceMappingURL=lock.js.map
}),
"[project]/node_modules/lucide-react/dist/esm/icons/lock.js [app-ssr] (ecmascript) <export default as Lock>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Lock",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/lock.js [app-ssr] (ecmascript)");
}),
"[project]/node_modules/lucide-react/dist/esm/icons/milk.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Milk
]);
/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-ssr] (ecmascript)");
;
const Milk = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])("Milk", [
    [
        "path",
        {
            d: "M8 2h8",
            key: "1ssgc1"
        }
    ],
    [
        "path",
        {
            d: "M9 2v2.789a4 4 0 0 1-.672 2.219l-.656.984A4 4 0 0 0 7 10.212V20a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-9.789a4 4 0 0 0-.672-2.219l-.656-.984A4 4 0 0 1 15 4.788V2",
            key: "qtp12x"
        }
    ],
    [
        "path",
        {
            d: "M7 15a6.472 6.472 0 0 1 5 0 6.47 6.47 0 0 0 5 0",
            key: "ygeh44"
        }
    ]
]);
;
 //# sourceMappingURL=milk.js.map
}),
"[project]/node_modules/lucide-react/dist/esm/icons/milk.js [app-ssr] (ecmascript) <export default as Milk>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Milk",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$milk$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$milk$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/milk.js [app-ssr] (ecmascript)");
}),
"[project]/node_modules/lucide-react/dist/esm/icons/utensils-crossed.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>UtensilsCrossed
]);
/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-ssr] (ecmascript)");
;
const UtensilsCrossed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])("UtensilsCrossed", [
    [
        "path",
        {
            d: "m16 2-2.3 2.3a3 3 0 0 0 0 4.2l1.8 1.8a3 3 0 0 0 4.2 0L22 8",
            key: "n7qcjb"
        }
    ],
    [
        "path",
        {
            d: "M15 15 3.3 3.3a4.2 4.2 0 0 0 0 6l7.3 7.3c.7.7 2 .7 2.8 0L15 15Zm0 0 7 7",
            key: "d0u48b"
        }
    ],
    [
        "path",
        {
            d: "m2.1 21.8 6.4-6.3",
            key: "yn04lh"
        }
    ],
    [
        "path",
        {
            d: "m19 5-7 7",
            key: "194lzd"
        }
    ]
]);
;
 //# sourceMappingURL=utensils-crossed.js.map
}),
"[project]/node_modules/lucide-react/dist/esm/icons/utensils-crossed.js [app-ssr] (ecmascript) <export default as UtensilsCrossed>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "UtensilsCrossed",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$utensils$2d$crossed$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$utensils$2d$crossed$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/utensils-crossed.js [app-ssr] (ecmascript)");
}),
"[project]/node_modules/typewriter-effect/dist/react.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {

!function(e, t) {
    ("TURBOPACK compile-time truthy", 1) ? module.exports = t(__turbopack_context__.r("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)")) : "TURBOPACK unreachable";
}("undefined" != typeof self ? self : /*TURBOPACK member replacement*/ __turbopack_context__.e, (e)=>(()=>{
        var t = {
            2: (e, t, r)=>{
                var n = r(2199), o = r(4664), a = r(5950);
                e.exports = function(e) {
                    return n(e, a, o);
                };
            },
            79: (e, t, r)=>{
                var n = r(3702), o = r(80), a = r(4739), i = r(8655), s = r(1175);
                function u(e) {
                    var t = -1, r = null == e ? 0 : e.length;
                    for(this.clear(); ++t < r;){
                        var n = e[t];
                        this.set(n[0], n[1]);
                    }
                }
                u.prototype.clear = n, u.prototype.delete = o, u.prototype.get = a, u.prototype.has = i, u.prototype.set = s, e.exports = u;
            },
            80: (e, t, r)=>{
                var n = r(6025), o = Array.prototype.splice;
                e.exports = function(e) {
                    var t = this.__data__, r = n(t, e);
                    return !(r < 0 || (r == t.length - 1 ? t.pop() : o.call(t, r, 1), --this.size, 0));
                };
            },
            270: (e, t, r)=>{
                var n = r(7068), o = r(346);
                e.exports = function e(t, r, a, i, s) {
                    return t === r || (null == t || null == r || !o(t) && !o(r) ? t != t && r != r : n(t, r, a, i, e, s));
                };
            },
            289: (e, t, r)=>{
                var n = r(2651);
                e.exports = function(e) {
                    return n(this, e).get(e);
                };
            },
            294: (e)=>{
                e.exports = function(e) {
                    return "number" == typeof e && e > -1 && e % 1 == 0 && e <= 9007199254740991;
                };
            },
            317: (e)=>{
                e.exports = function(e) {
                    var t = -1, r = Array(e.size);
                    return e.forEach(function(e, n) {
                        r[++t] = [
                            n,
                            e
                        ];
                    }), r;
                };
            },
            346: (e)=>{
                e.exports = function(e) {
                    return null != e && "object" == typeof e;
                };
            },
            361: (e)=>{
                var t = /^(?:0|[1-9]\d*)$/;
                e.exports = function(e, r) {
                    var n = typeof e;
                    return !!(r = null == r ? 9007199254740991 : r) && ("number" == n || "symbol" != n && t.test(e)) && e > -1 && e % 1 == 0 && e < r;
                };
            },
            392: (e)=>{
                e.exports = function(e, t) {
                    return null == e ? void 0 : e[t];
                };
            },
            659: (e, t, r)=>{
                var n = r(1873), o = Object.prototype, a = o.hasOwnProperty, i = o.toString, s = n ? n.toStringTag : void 0;
                e.exports = function(e) {
                    var t = a.call(e, s), r = e[s];
                    try {
                        e[s] = void 0;
                        var n = !0;
                    } catch (e) {}
                    var o = i.call(e);
                    return n && (t ? e[s] = r : delete e[s]), o;
                };
            },
            689: (e, t, r)=>{
                var n = r(2), o = Object.prototype.hasOwnProperty;
                e.exports = function(e, t, r, a, i, s) {
                    var u = 1 & r, c = n(e), p = c.length;
                    if (p != n(t).length && !u) return !1;
                    for(var l = p; l--;){
                        var f = c[l];
                        if (!(u ? f in t : o.call(t, f))) return !1;
                    }
                    var v = s.get(e), d = s.get(t);
                    if (v && d) return v == t && d == e;
                    var h = !0;
                    s.set(e, t), s.set(t, e);
                    for(var y = u; ++l < p;){
                        var b = e[f = c[l]], m = t[f];
                        if (a) var _ = u ? a(m, b, f, t, e, s) : a(b, m, f, e, t, s);
                        if (!(void 0 === _ ? b === m || i(b, m, r, a, s) : _)) {
                            h = !1;
                            break;
                        }
                        y || (y = "constructor" == f);
                    }
                    if (h && !y) {
                        var g = e.constructor, w = t.constructor;
                        g == w || !("constructor" in e) || !("constructor" in t) || "function" == typeof g && g instanceof g && "function" == typeof w && w instanceof w || (h = !1);
                    }
                    return s.delete(e), s.delete(t), h;
                };
            },
            695: (e, t, r)=>{
                var n = r(8096), o = r(2428), a = r(6449), i = r(3656), s = r(361), u = r(7167), c = Object.prototype.hasOwnProperty;
                e.exports = function(e, t) {
                    var r = a(e), p = !r && o(e), l = !r && !p && i(e), f = !r && !p && !l && u(e), v = r || p || l || f, d = v ? n(e.length, String) : [], h = d.length;
                    for(var y in e)!t && !c.call(e, y) || v && ("length" == y || l && ("offset" == y || "parent" == y) || f && ("buffer" == y || "byteLength" == y || "byteOffset" == y) || s(y, h)) || d.push(y);
                    return d;
                };
            },
            938: (e)=>{
                e.exports = function(e) {
                    var t = this.__data__, r = t.delete(e);
                    return this.size = t.size, r;
                };
            },
            945: (e, t, r)=>{
                var n = r(79), o = r(8223), a = r(3661);
                e.exports = function(e, t) {
                    var r = this.__data__;
                    if (r instanceof n) {
                        var i = r.__data__;
                        if (!o || i.length < 199) return i.push([
                            e,
                            t
                        ]), this.size = ++r.size, this;
                        r = this.__data__ = new a(i);
                    }
                    return r.set(e, t), this.size = r.size, this;
                };
            },
            1042: (e, t, r)=>{
                var n = r(6110)(Object, "create");
                e.exports = n;
            },
            1175: (e, t, r)=>{
                var n = r(6025);
                e.exports = function(e, t) {
                    var r = this.__data__, o = n(r, e);
                    return o < 0 ? (++this.size, r.push([
                        e,
                        t
                    ])) : r[o][1] = t, this;
                };
            },
            1380: (e)=>{
                e.exports = function(e) {
                    return this.__data__.set(e, "__lodash_hash_undefined__"), this;
                };
            },
            1420: (e, t, r)=>{
                var n = r(79);
                e.exports = function() {
                    this.__data__ = new n, this.size = 0;
                };
            },
            1459: (e)=>{
                e.exports = function(e) {
                    return this.__data__.has(e);
                };
            },
            1549: (e, t, r)=>{
                var n = r(2032), o = r(3862), a = r(6721), i = r(2749), s = r(5749);
                function u(e) {
                    var t = -1, r = null == e ? 0 : e.length;
                    for(this.clear(); ++t < r;){
                        var n = e[t];
                        this.set(n[0], n[1]);
                    }
                }
                u.prototype.clear = n, u.prototype.delete = o, u.prototype.get = a, u.prototype.has = i, u.prototype.set = s, e.exports = u;
            },
            1873: (e, t, r)=>{
                var n = r(9325).Symbol;
                e.exports = n;
            },
            1882: (e, t, r)=>{
                var n = r(2552), o = r(3805);
                e.exports = function(e) {
                    if (!o(e)) return !1;
                    var t = n(e);
                    return "[object Function]" == t || "[object GeneratorFunction]" == t || "[object AsyncFunction]" == t || "[object Proxy]" == t;
                };
            },
            1986: (e, t, r)=>{
                var n = r(1873), o = r(7828), a = r(5288), i = r(5911), s = r(317), u = r(4247), c = n ? n.prototype : void 0, p = c ? c.valueOf : void 0;
                e.exports = function(e, t, r, n, c, l, f) {
                    switch(r){
                        case "[object DataView]":
                            if (e.byteLength != t.byteLength || e.byteOffset != t.byteOffset) return !1;
                            e = e.buffer, t = t.buffer;
                        case "[object ArrayBuffer]":
                            return !(e.byteLength != t.byteLength || !l(new o(e), new o(t)));
                        case "[object Boolean]":
                        case "[object Date]":
                        case "[object Number]":
                            return a(+e, +t);
                        case "[object Error]":
                            return e.name == t.name && e.message == t.message;
                        case "[object RegExp]":
                        case "[object String]":
                            return e == t + "";
                        case "[object Map]":
                            var v = s;
                        case "[object Set]":
                            var d = 1 & n;
                            if (v || (v = u), e.size != t.size && !d) return !1;
                            var h = f.get(e);
                            if (h) return h == t;
                            n |= 2, f.set(e, t);
                            var y = i(v(e), v(t), n, c, l, f);
                            return f.delete(e), y;
                        case "[object Symbol]":
                            if (p) return p.call(e) == p.call(t);
                    }
                    return !1;
                };
            },
            2032: (e, t, r)=>{
                var n = r(1042);
                e.exports = function() {
                    this.__data__ = n ? n(null) : {}, this.size = 0;
                };
            },
            2199: (e, t, r)=>{
                var n = r(4528), o = r(6449);
                e.exports = function(e, t, r) {
                    var a = t(e);
                    return o(e) ? a : n(a, r(e));
                };
            },
            2404: (e, t, r)=>{
                var n = r(270);
                e.exports = function(e, t) {
                    return n(e, t);
                };
            },
            2428: (e, t, r)=>{
                var n = r(7534), o = r(346), a = Object.prototype, i = a.hasOwnProperty, s = a.propertyIsEnumerable, u = n(function() {
                    return arguments;
                }()) ? n : function(e) {
                    return o(e) && i.call(e, "callee") && !s.call(e, "callee");
                };
                e.exports = u;
            },
            2552: (e, t, r)=>{
                var n = r(1873), o = r(659), a = r(9350), i = n ? n.toStringTag : void 0;
                e.exports = function(e) {
                    return null == e ? void 0 === e ? "[object Undefined]" : "[object Null]" : i && i in Object(e) ? o(e) : a(e);
                };
            },
            2651: (e, t, r)=>{
                var n = r(4218);
                e.exports = function(e, t) {
                    var r = e.__data__;
                    return n(t) ? r["string" == typeof t ? "string" : "hash"] : r.map;
                };
            },
            2749: (e, t, r)=>{
                var n = r(1042), o = Object.prototype.hasOwnProperty;
                e.exports = function(e) {
                    var t = this.__data__;
                    return n ? void 0 !== t[e] : o.call(t, e);
                };
            },
            2804: (e, t, r)=>{
                var n = r(6110)(r(9325), "Promise");
                e.exports = n;
            },
            2949: (e, t, r)=>{
                var n = r(2651);
                e.exports = function(e, t) {
                    var r = n(this, e), o = r.size;
                    return r.set(e, t), this.size += r.size == o ? 0 : 1, this;
                };
            },
            3040: (e, t, r)=>{
                var n = r(1549), o = r(79), a = r(8223);
                e.exports = function() {
                    this.size = 0, this.__data__ = {
                        hash: new n,
                        map: new (a || o),
                        string: new n
                    };
                };
            },
            3146: (e, t, r)=>{
                for(var n = r(3491), o = ("TURBOPACK compile-time truthy", 1) ? r.g : "TURBOPACK unreachable", a = [
                    "moz",
                    "webkit"
                ], i = "AnimationFrame", s = o["request" + i], u = o["cancel" + i] || o["cancelRequest" + i], c = 0; !s && c < a.length; c++)s = o[a[c] + "Request" + i], u = o[a[c] + "Cancel" + i] || o[a[c] + "CancelRequest" + i];
                if (!s || !u) {
                    var p = 0, l = 0, f = [], v = 1e3 / 60;
                    s = function(e) {
                        if (0 === f.length) {
                            var t = n(), r = Math.max(0, v - (t - p));
                            p = r + t, setTimeout(function() {
                                var e = f.slice(0);
                                f.length = 0;
                                for(var t = 0; t < e.length; t++)if (!e[t].cancelled) try {
                                    e[t].callback(p);
                                } catch (e) {
                                    setTimeout(function() {
                                        throw e;
                                    }, 0);
                                }
                            }, Math.round(r));
                        }
                        return f.push({
                            handle: ++l,
                            callback: e,
                            cancelled: !1
                        }), l;
                    }, u = function(e) {
                        for(var t = 0; t < f.length; t++)f[t].handle === e && (f[t].cancelled = !0);
                    };
                }
                e.exports = function(e) {
                    return s.call(o, e);
                }, e.exports.cancel = function() {
                    u.apply(o, arguments);
                }, e.exports.polyfill = function(e) {
                    e || (e = o), e.requestAnimationFrame = s, e.cancelAnimationFrame = u;
                };
            },
            3345: (e)=>{
                e.exports = function() {
                    return [];
                };
            },
            3491: function(e) {
                (function() {
                    var t, r, n, o, a, i;
                    "undefined" != typeof performance && null !== performance && performance.now ? e.exports = function() {
                        return performance.now();
                    } : "undefined" != typeof process && null !== process && process.hrtime ? (e.exports = function() {
                        return (t() - a) / 1e6;
                    }, r = process.hrtime, o = (t = function() {
                        var e;
                        return 1e9 * (e = r())[0] + e[1];
                    })(), i = 1e9 * process.uptime(), a = o - i) : Date.now ? (e.exports = function() {
                        return Date.now() - n;
                    }, n = Date.now()) : (e.exports = function() {
                        return (new Date).getTime() - n;
                    }, n = (new Date).getTime());
                }).call(this);
            },
            3605: (e)=>{
                e.exports = function(e) {
                    return this.__data__.get(e);
                };
            },
            3650: (e, t, r)=>{
                var n = r(4335)(Object.keys, Object);
                e.exports = n;
            },
            3656: (e, t, r)=>{
                e = r.nmd(e);
                var n = r(9325), o = r(9935), a = t && !t.nodeType && t, i = a && e && !e.nodeType && e, s = i && i.exports === a ? n.Buffer : void 0, u = (s ? s.isBuffer : void 0) || o;
                e.exports = u;
            },
            3661: (e, t, r)=>{
                var n = r(3040), o = r(7670), a = r(289), i = r(4509), s = r(2949);
                function u(e) {
                    var t = -1, r = null == e ? 0 : e.length;
                    for(this.clear(); ++t < r;){
                        var n = e[t];
                        this.set(n[0], n[1]);
                    }
                }
                u.prototype.clear = n, u.prototype.delete = o, u.prototype.get = a, u.prototype.has = i, u.prototype.set = s, e.exports = u;
            },
            3702: (e)=>{
                e.exports = function() {
                    this.__data__ = [], this.size = 0;
                };
            },
            3805: (e)=>{
                e.exports = function(e) {
                    var t = typeof e;
                    return null != e && ("object" == t || "function" == t);
                };
            },
            3862: (e)=>{
                e.exports = function(e) {
                    var t = this.has(e) && delete this.__data__[e];
                    return this.size -= t ? 1 : 0, t;
                };
            },
            4218: (e)=>{
                e.exports = function(e) {
                    var t = typeof e;
                    return "string" == t || "number" == t || "symbol" == t || "boolean" == t ? "__proto__" !== e : null === e;
                };
            },
            4247: (e)=>{
                e.exports = function(e) {
                    var t = -1, r = Array(e.size);
                    return e.forEach(function(e) {
                        r[++t] = e;
                    }), r;
                };
            },
            4248: (e)=>{
                e.exports = function(e, t) {
                    for(var r = -1, n = null == e ? 0 : e.length; ++r < n;)if (t(e[r], r, e)) return !0;
                    return !1;
                };
            },
            4335: (e)=>{
                e.exports = function(e, t) {
                    return function(r) {
                        return e(t(r));
                    };
                };
            },
            4509: (e, t, r)=>{
                var n = r(2651);
                e.exports = function(e) {
                    return n(this, e).has(e);
                };
            },
            4528: (e)=>{
                e.exports = function(e, t) {
                    for(var r = -1, n = t.length, o = e.length; ++r < n;)e[o + r] = t[r];
                    return e;
                };
            },
            4664: (e, t, r)=>{
                var n = r(9770), o = r(3345), a = Object.prototype.propertyIsEnumerable, i = Object.getOwnPropertySymbols, s = i ? function(e) {
                    return null == e ? [] : (e = Object(e), n(i(e), function(t) {
                        return a.call(e, t);
                    }));
                } : o;
                e.exports = s;
            },
            4739: (e, t, r)=>{
                var n = r(6025);
                e.exports = function(e) {
                    var t = this.__data__, r = n(t, e);
                    return r < 0 ? void 0 : t[r][1];
                };
            },
            4840: (e, t, r)=>{
                var n = "object" == typeof r.g && r.g && r.g.Object === Object && r.g;
                e.exports = n;
            },
            4894: (e, t, r)=>{
                var n = r(1882), o = r(294);
                e.exports = function(e) {
                    return null != e && o(e.length) && !n(e);
                };
            },
            4901: (e, t, r)=>{
                var n = r(2552), o = r(294), a = r(346), i = {};
                i["[object Float32Array]"] = i["[object Float64Array]"] = i["[object Int8Array]"] = i["[object Int16Array]"] = i["[object Int32Array]"] = i["[object Uint8Array]"] = i["[object Uint8ClampedArray]"] = i["[object Uint16Array]"] = i["[object Uint32Array]"] = !0, i["[object Arguments]"] = i["[object Array]"] = i["[object ArrayBuffer]"] = i["[object Boolean]"] = i["[object DataView]"] = i["[object Date]"] = i["[object Error]"] = i["[object Function]"] = i["[object Map]"] = i["[object Number]"] = i["[object Object]"] = i["[object RegExp]"] = i["[object Set]"] = i["[object String]"] = i["[object WeakMap]"] = !1, e.exports = function(e) {
                    return a(e) && o(e.length) && !!i[n(e)];
                };
            },
            5083: (e, t, r)=>{
                var n = r(1882), o = r(7296), a = r(3805), i = r(7473), s = /^\[object .+?Constructor\]$/, u = Function.prototype, c = Object.prototype, p = u.toString, l = c.hasOwnProperty, f = RegExp("^" + p.call(l).replace(/[\\^$.*+?()[\]{}|]/g, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$");
                e.exports = function(e) {
                    return !(!a(e) || o(e)) && (n(e) ? f : s).test(i(e));
                };
            },
            5288: (e)=>{
                e.exports = function(e, t) {
                    return e === t || e != e && t != t;
                };
            },
            5481: (e, t, r)=>{
                var n = r(9325)["__core-js_shared__"];
                e.exports = n;
            },
            5527: (e)=>{
                var t = Object.prototype;
                e.exports = function(e) {
                    var r = e && e.constructor;
                    return e === ("function" == typeof r && r.prototype || t);
                };
            },
            5580: (e, t, r)=>{
                var n = r(6110)(r(9325), "DataView");
                e.exports = n;
            },
            5749: (e, t, r)=>{
                var n = r(1042);
                e.exports = function(e, t) {
                    var r = this.__data__;
                    return this.size += this.has(e) ? 0 : 1, r[e] = n && void 0 === t ? "__lodash_hash_undefined__" : t, this;
                };
            },
            5861: (e, t, r)=>{
                var n = r(5580), o = r(8223), a = r(2804), i = r(6545), s = r(8303), u = r(2552), c = r(7473), p = "[object Map]", l = "[object Promise]", f = "[object Set]", v = "[object WeakMap]", d = "[object DataView]", h = c(n), y = c(o), b = c(a), m = c(i), _ = c(s), g = u;
                (n && g(new n(new ArrayBuffer(1))) != d || o && g(new o) != p || a && g(a.resolve()) != l || i && g(new i) != f || s && g(new s) != v) && (g = function(e) {
                    var t = u(e), r = "[object Object]" == t ? e.constructor : void 0, n = r ? c(r) : "";
                    if (n) switch(n){
                        case h:
                            return d;
                        case y:
                            return p;
                        case b:
                            return l;
                        case m:
                            return f;
                        case _:
                            return v;
                    }
                    return t;
                }), e.exports = g;
            },
            5911: (e, t, r)=>{
                var n = r(8859), o = r(4248), a = r(9219);
                e.exports = function(e, t, r, i, s, u) {
                    var c = 1 & r, p = e.length, l = t.length;
                    if (p != l && !(c && l > p)) return !1;
                    var f = u.get(e), v = u.get(t);
                    if (f && v) return f == t && v == e;
                    var d = -1, h = !0, y = 2 & r ? new n : void 0;
                    for(u.set(e, t), u.set(t, e); ++d < p;){
                        var b = e[d], m = t[d];
                        if (i) var _ = c ? i(m, b, d, t, e, u) : i(b, m, d, e, t, u);
                        if (void 0 !== _) {
                            if (_) continue;
                            h = !1;
                            break;
                        }
                        if (y) {
                            if (!o(t, function(e, t) {
                                if (!a(y, t) && (b === e || s(b, e, r, i, u))) return y.push(t);
                            })) {
                                h = !1;
                                break;
                            }
                        } else if (b !== m && !s(b, m, r, i, u)) {
                            h = !1;
                            break;
                        }
                    }
                    return u.delete(e), u.delete(t), h;
                };
            },
            5950: (e, t, r)=>{
                var n = r(695), o = r(8984), a = r(4894);
                e.exports = function(e) {
                    return a(e) ? n(e) : o(e);
                };
            },
            6009: (e, t, r)=>{
                e = r.nmd(e);
                var n = r(4840), o = t && !t.nodeType && t, a = o && e && !e.nodeType && e, i = a && a.exports === o && n.process, s = function() {
                    try {
                        return a && a.require && a.require("util").types || i && i.binding && i.binding("util");
                    } catch (e) {}
                }();
                e.exports = s;
            },
            6025: (e, t, r)=>{
                var n = r(5288);
                e.exports = function(e, t) {
                    for(var r = e.length; r--;)if (n(e[r][0], t)) return r;
                    return -1;
                };
            },
            6110: (e, t, r)=>{
                var n = r(5083), o = r(392);
                e.exports = function(e, t) {
                    var r = o(e, t);
                    return n(r) ? r : void 0;
                };
            },
            6449: (e)=>{
                var t = Array.isArray;
                e.exports = t;
            },
            6545: (e, t, r)=>{
                var n = r(6110)(r(9325), "Set");
                e.exports = n;
            },
            6721: (e, t, r)=>{
                var n = r(1042), o = Object.prototype.hasOwnProperty;
                e.exports = function(e) {
                    var t = this.__data__;
                    if (n) {
                        var r = t[e];
                        return "__lodash_hash_undefined__" === r ? void 0 : r;
                    }
                    return o.call(t, e) ? t[e] : void 0;
                };
            },
            7068: (e, t, r)=>{
                var n = r(7217), o = r(5911), a = r(1986), i = r(689), s = r(5861), u = r(6449), c = r(3656), p = r(7167), l = "[object Arguments]", f = "[object Array]", v = "[object Object]", d = Object.prototype.hasOwnProperty;
                e.exports = function(e, t, r, h, y, b) {
                    var m = u(e), _ = u(t), g = m ? f : s(e), w = _ ? f : s(t), x = (g = g == l ? v : g) == v, j = (w = w == l ? v : w) == v, E = g == w;
                    if (E && c(e)) {
                        if (!c(t)) return !1;
                        m = !0, x = !1;
                    }
                    if (E && !x) return b || (b = new n), m || p(e) ? o(e, t, r, h, y, b) : a(e, t, g, r, h, y, b);
                    if (!(1 & r)) {
                        var O = x && d.call(e, "__wrapped__"), T = j && d.call(t, "__wrapped__");
                        if (O || T) {
                            var A = O ? e.value() : e, S = T ? t.value() : t;
                            return b || (b = new n), y(A, S, r, h, b);
                        }
                    }
                    return !!E && (b || (b = new n), i(e, t, r, h, y, b));
                };
            },
            7167: (e, t, r)=>{
                var n = r(4901), o = r(7301), a = r(6009), i = a && a.isTypedArray, s = i ? o(i) : n;
                e.exports = s;
            },
            7217: (e, t, r)=>{
                var n = r(79), o = r(1420), a = r(938), i = r(3605), s = r(9817), u = r(945);
                function c(e) {
                    var t = this.__data__ = new n(e);
                    this.size = t.size;
                }
                c.prototype.clear = o, c.prototype.delete = a, c.prototype.get = i, c.prototype.has = s, c.prototype.set = u, e.exports = c;
            },
            7296: (e, t, r)=>{
                var n, o = r(5481), a = (n = /[^.]+$/.exec(o && o.keys && o.keys.IE_PROTO || "")) ? "Symbol(src)_1." + n : "";
                e.exports = function(e) {
                    return !!a && a in e;
                };
            },
            7301: (e)=>{
                e.exports = function(e) {
                    return function(t) {
                        return e(t);
                    };
                };
            },
            7473: (e)=>{
                var t = Function.prototype.toString;
                e.exports = function(e) {
                    if (null != e) {
                        try {
                            return t.call(e);
                        } catch (e) {}
                        try {
                            return e + "";
                        } catch (e) {}
                    }
                    return "";
                };
            },
            7534: (e, t, r)=>{
                var n = r(2552), o = r(346);
                e.exports = function(e) {
                    return o(e) && "[object Arguments]" == n(e);
                };
            },
            7670: (e, t, r)=>{
                var n = r(2651);
                e.exports = function(e) {
                    var t = n(this, e).delete(e);
                    return this.size -= t ? 1 : 0, t;
                };
            },
            7828: (e, t, r)=>{
                var n = r(9325).Uint8Array;
                e.exports = n;
            },
            8096: (e)=>{
                e.exports = function(e, t) {
                    for(var r = -1, n = Array(e); ++r < e;)n[r] = t(r);
                    return n;
                };
            },
            8223: (e, t, r)=>{
                var n = r(6110)(r(9325), "Map");
                e.exports = n;
            },
            8303: (e, t, r)=>{
                var n = r(6110)(r(9325), "WeakMap");
                e.exports = n;
            },
            8655: (e, t, r)=>{
                var n = r(6025);
                e.exports = function(e) {
                    return n(this.__data__, e) > -1;
                };
            },
            8859: (e, t, r)=>{
                var n = r(3661), o = r(1380), a = r(1459);
                function i(e) {
                    var t = -1, r = null == e ? 0 : e.length;
                    for(this.__data__ = new n; ++t < r;)this.add(e[t]);
                }
                i.prototype.add = i.prototype.push = o, i.prototype.has = a, e.exports = i;
            },
            8984: (e, t, r)=>{
                var n = r(5527), o = r(3650), a = Object.prototype.hasOwnProperty;
                e.exports = function(e) {
                    if (!n(e)) return o(e);
                    var t = [];
                    for(var r in Object(e))a.call(e, r) && "constructor" != r && t.push(r);
                    return t;
                };
            },
            9155: (t)=>{
                "use strict";
                t.exports = e;
            },
            9219: (e)=>{
                e.exports = function(e, t) {
                    return e.has(t);
                };
            },
            9325: (e, t, r)=>{
                var n = r(4840), o = "object" == typeof self && self && self.Object === Object && self, a = n || o || Function("return this")();
                e.exports = a;
            },
            9350: (e)=>{
                var t = Object.prototype.toString;
                e.exports = function(e) {
                    return t.call(e);
                };
            },
            9770: (e)=>{
                e.exports = function(e, t) {
                    for(var r = -1, n = null == e ? 0 : e.length, o = 0, a = []; ++r < n;){
                        var i = e[r];
                        t(i, r, e) && (a[o++] = i);
                    }
                    return a;
                };
            },
            9817: (e)=>{
                e.exports = function(e) {
                    return this.__data__.has(e);
                };
            },
            9905: (e, t, r)=>{
                "use strict";
                r.d(t, {
                    default: ()=>A
                });
                var n = r(3146), o = r.n(n);
                const a = function(e) {
                    return new RegExp(/<[a-z][\s\S]*>/i).test(e);
                }, i = function(e, t) {
                    return Math.floor(Math.random() * (t - e + 1)) + e;
                };
                var s = "TYPE_CHARACTER", u = "REMOVE_CHARACTER", c = "REMOVE_ALL", p = "REMOVE_LAST_VISIBLE_NODE", l = "PAUSE_FOR", f = "CALL_FUNCTION", v = "ADD_HTML_TAG_ELEMENT", d = "CHANGE_DELETE_SPEED", h = "CHANGE_DELAY", y = "CHANGE_CURSOR", b = "PASTE_STRING", m = "HTML_TAG";
                function _(e) {
                    return _ = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e) {
                        return typeof e;
                    } : function(e) {
                        return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
                    }, _(e);
                }
                function g(e, t) {
                    var r = Object.keys(e);
                    if (Object.getOwnPropertySymbols) {
                        var n = Object.getOwnPropertySymbols(e);
                        t && (n = n.filter(function(t) {
                            return Object.getOwnPropertyDescriptor(e, t).enumerable;
                        })), r.push.apply(r, n);
                    }
                    return r;
                }
                function w(e) {
                    for(var t = 1; t < arguments.length; t++){
                        var r = null != arguments[t] ? arguments[t] : {};
                        t % 2 ? g(Object(r), !0).forEach(function(t) {
                            O(e, t, r[t]);
                        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r)) : g(Object(r)).forEach(function(t) {
                            Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(r, t));
                        });
                    }
                    return e;
                }
                function x(e) {
                    return function(e) {
                        if (Array.isArray(e)) return j(e);
                    }(e) || function(e) {
                        if ("undefined" != typeof Symbol && null != e[Symbol.iterator] || null != e["@@iterator"]) return Array.from(e);
                    }(e) || function(e, t) {
                        if (e) {
                            if ("string" == typeof e) return j(e, t);
                            var r = ({}).toString.call(e).slice(8, -1);
                            return "Object" === r && e.constructor && (r = e.constructor.name), "Map" === r || "Set" === r ? Array.from(e) : "Arguments" === r || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r) ? j(e, t) : void 0;
                        }
                    }(e) || function() {
                        throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
                    }();
                }
                function j(e, t) {
                    (null == t || t > e.length) && (t = e.length);
                    for(var r = 0, n = Array(t); r < t; r++)n[r] = e[r];
                    return n;
                }
                function E(e, t) {
                    for(var r = 0; r < t.length; r++){
                        var n = t[r];
                        n.enumerable = n.enumerable || !1, n.configurable = !0, "value" in n && (n.writable = !0), Object.defineProperty(e, T(n.key), n);
                    }
                }
                function O(e, t, r) {
                    return (t = T(t)) in e ? Object.defineProperty(e, t, {
                        value: r,
                        enumerable: !0,
                        configurable: !0,
                        writable: !0
                    }) : e[t] = r, e;
                }
                function T(e) {
                    var t = function(e) {
                        if ("object" != _(e) || !e) return e;
                        var t = e[Symbol.toPrimitive];
                        if (void 0 !== t) {
                            var r = t.call(e, "string");
                            if ("object" != _(r)) return r;
                            throw new TypeError("@@toPrimitive must return a primitive value.");
                        }
                        return String(e);
                    }(e);
                    return "symbol" == _(t) ? t : t + "";
                }
                const A = function() {
                    function e(t, r) {
                        var _ = this;
                        if (function(e, t) {
                            if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function");
                        }(this, e), O(this, "state", {
                            cursorAnimation: null,
                            lastFrameTime: null,
                            pauseUntil: null,
                            eventQueue: [],
                            eventLoop: null,
                            eventLoopPaused: !1,
                            reverseCalledEvents: [],
                            calledEvents: [],
                            visibleNodes: [],
                            initialOptions: null,
                            elements: {
                                container: null,
                                wrapper: document.createElement("span"),
                                cursor: document.createElement("span")
                            }
                        }), O(this, "options", {
                            strings: null,
                            cursor: "|",
                            delay: "natural",
                            pauseFor: 1500,
                            deleteSpeed: "natural",
                            loop: !1,
                            autoStart: !1,
                            devMode: !1,
                            skipAddStyles: !1,
                            wrapperClassName: "Typewriter__wrapper",
                            cursorClassName: "Typewriter__cursor",
                            stringSplitter: null,
                            onCreateTextNode: null,
                            onRemoveNode: null
                        }), O(this, "setupWrapperElement", function() {
                            _.state.elements.container && (_.state.elements.wrapper.className = _.options.wrapperClassName, _.state.elements.cursor.className = _.options.cursorClassName, _.state.elements.cursor.innerHTML = _.options.cursor, _.state.elements.container.innerHTML = "", _.state.elements.container.appendChild(_.state.elements.wrapper), _.state.elements.container.appendChild(_.state.elements.cursor));
                        }), O(this, "start", function() {
                            return _.state.eventLoopPaused = !1, _.runEventLoop(), _;
                        }), O(this, "pause", function() {
                            return _.state.eventLoopPaused = !0, _;
                        }), O(this, "stop", function() {
                            return _.state.eventLoop && ((0, n.cancel)(_.state.eventLoop), _.state.eventLoop = null), _;
                        }), O(this, "pauseFor", function(e) {
                            return _.addEventToQueue(l, {
                                ms: e
                            }), _;
                        }), O(this, "typeOutAllStrings", function() {
                            return "string" == typeof _.options.strings ? (_.typeString(_.options.strings).pauseFor(_.options.pauseFor), _) : (_.options.strings.forEach(function(e) {
                                _.typeString(e).pauseFor(_.options.pauseFor).deleteAll(_.options.deleteSpeed);
                            }), _);
                        }), O(this, "typeString", function(e) {
                            var t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : null;
                            if (a(e)) return _.typeOutHTMLString(e, t);
                            if (e) {
                                var r = (_.options || {}).stringSplitter, n = "function" == typeof r ? r(e) : e.split("");
                                _.typeCharacters(n, t);
                            }
                            return _;
                        }), O(this, "pasteString", function(e) {
                            var t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : null;
                            return a(e) ? _.typeOutHTMLString(e, t, !0) : (e && _.addEventToQueue(b, {
                                character: e,
                                node: t
                            }), _);
                        }), O(this, "typeOutHTMLString", function(e) {
                            var t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : null, r = arguments.length > 2 ? arguments[2] : void 0, n = function(e) {
                                var t = document.createElement("div");
                                return t.innerHTML = e, t.childNodes;
                            }(e);
                            if (n.length > 0) for(var o = 0; o < n.length; o++){
                                var a = n[o], i = a.innerHTML;
                                a && 3 !== a.nodeType ? (a.innerHTML = "", _.addEventToQueue(v, {
                                    node: a,
                                    parentNode: t
                                }), r ? _.pasteString(i, a) : _.typeString(i, a)) : a.textContent && (r ? _.pasteString(a.textContent, t) : _.typeString(a.textContent, t));
                            }
                            return _;
                        }), O(this, "deleteAll", function() {
                            var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "natural";
                            return _.addEventToQueue(c, {
                                speed: e
                            }), _;
                        }), O(this, "changeDeleteSpeed", function(e) {
                            if (!e) throw new Error("Must provide new delete speed");
                            return _.addEventToQueue(d, {
                                speed: e
                            }), _;
                        }), O(this, "changeDelay", function(e) {
                            if (!e) throw new Error("Must provide new delay");
                            return _.addEventToQueue(h, {
                                delay: e
                            }), _;
                        }), O(this, "changeCursor", function(e) {
                            if (!e) throw new Error("Must provide new cursor");
                            return _.addEventToQueue(y, {
                                cursor: e
                            }), _;
                        }), O(this, "deleteChars", function(e) {
                            if (!e) throw new Error("Must provide amount of characters to delete");
                            for(var t = 0; t < e; t++)_.addEventToQueue(u);
                            return _;
                        }), O(this, "callFunction", function(e, t) {
                            if (!e || "function" != typeof e) throw new Error("Callback must be a function");
                            return _.addEventToQueue(f, {
                                cb: e,
                                thisArg: t
                            }), _;
                        }), O(this, "typeCharacters", function(e) {
                            var t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : null;
                            if (!e || !Array.isArray(e)) throw new Error("Characters must be an array");
                            return e.forEach(function(e) {
                                _.addEventToQueue(s, {
                                    character: e,
                                    node: t
                                });
                            }), _;
                        }), O(this, "removeCharacters", function(e) {
                            if (!e || !Array.isArray(e)) throw new Error("Characters must be an array");
                            return e.forEach(function() {
                                _.addEventToQueue(u);
                            }), _;
                        }), O(this, "addEventToQueue", function(e, t) {
                            var r = arguments.length > 2 && void 0 !== arguments[2] && arguments[2];
                            return _.addEventToStateProperty(e, t, r, "eventQueue");
                        }), O(this, "addReverseCalledEvent", function(e, t) {
                            var r = arguments.length > 2 && void 0 !== arguments[2] && arguments[2];
                            return _.options.loop ? _.addEventToStateProperty(e, t, r, "reverseCalledEvents") : _;
                        }), O(this, "addEventToStateProperty", function(e, t) {
                            var r = arguments.length > 2 && void 0 !== arguments[2] && arguments[2], n = arguments.length > 3 ? arguments[3] : void 0, o = {
                                eventName: e,
                                eventArgs: t || {}
                            };
                            return _.state[n] = r ? [
                                o
                            ].concat(x(_.state[n])) : [].concat(x(_.state[n]), [
                                o
                            ]), _;
                        }), O(this, "runEventLoop", function() {
                            _.state.lastFrameTime || (_.state.lastFrameTime = Date.now());
                            var e = Date.now(), t = e - _.state.lastFrameTime;
                            if (!_.state.eventQueue.length) {
                                if (!_.options.loop) return;
                                _.state.eventQueue = x(_.state.calledEvents), _.state.calledEvents = [], _.options = w({}, _.state.initialOptions);
                            }
                            if (_.state.eventLoop = o()(_.runEventLoop), !_.state.eventLoopPaused) {
                                if (_.state.pauseUntil) {
                                    if (e < _.state.pauseUntil) return;
                                    _.state.pauseUntil = null;
                                }
                                var r, n = x(_.state.eventQueue), a = n.shift();
                                if (!(t <= (r = a.eventName === p || a.eventName === u ? "natural" === _.options.deleteSpeed ? i(40, 80) : _.options.deleteSpeed : "natural" === _.options.delay ? i(120, 160) : _.options.delay))) {
                                    var g = a.eventName, j = a.eventArgs;
                                    switch(_.logInDevMode({
                                        currentEvent: a,
                                        state: _.state,
                                        delay: r
                                    }), g){
                                        case b:
                                        case s:
                                            var E = j.character, O = j.node, T = document.createTextNode(E), A = T;
                                            _.options.onCreateTextNode && "function" == typeof _.options.onCreateTextNode && (A = _.options.onCreateTextNode(E, T)), A && (O ? O.appendChild(A) : _.state.elements.wrapper.appendChild(A)), _.state.visibleNodes = [].concat(x(_.state.visibleNodes), [
                                                {
                                                    type: "TEXT_NODE",
                                                    character: E,
                                                    node: A
                                                }
                                            ]);
                                            break;
                                        case u:
                                            n.unshift({
                                                eventName: p,
                                                eventArgs: {
                                                    removingCharacterNode: !0
                                                }
                                            });
                                            break;
                                        case l:
                                            var S = a.eventArgs.ms;
                                            _.state.pauseUntil = Date.now() + parseInt(S);
                                            break;
                                        case f:
                                            var N = a.eventArgs, P = N.cb, C = N.thisArg;
                                            P.call(C, {
                                                elements: _.state.elements
                                            });
                                            break;
                                        case v:
                                            var L = a.eventArgs, k = L.node, D = L.parentNode;
                                            D ? D.appendChild(k) : _.state.elements.wrapper.appendChild(k), _.state.visibleNodes = [].concat(x(_.state.visibleNodes), [
                                                {
                                                    type: m,
                                                    node: k,
                                                    parentNode: D || _.state.elements.wrapper
                                                }
                                            ]);
                                            break;
                                        case c:
                                            var M = _.state.visibleNodes, R = j.speed, F = [];
                                            R && F.push({
                                                eventName: d,
                                                eventArgs: {
                                                    speed: R,
                                                    temp: !0
                                                }
                                            });
                                            for(var z = 0, Q = M.length; z < Q; z++)F.push({
                                                eventName: p,
                                                eventArgs: {
                                                    removingCharacterNode: !1
                                                }
                                            });
                                            R && F.push({
                                                eventName: d,
                                                eventArgs: {
                                                    speed: _.options.deleteSpeed,
                                                    temp: !0
                                                }
                                            }), n.unshift.apply(n, F);
                                            break;
                                        case p:
                                            var I = a.eventArgs.removingCharacterNode;
                                            if (_.state.visibleNodes.length) {
                                                var U = _.state.visibleNodes.pop(), H = U.type, q = U.node, B = U.character;
                                                _.options.onRemoveNode && "function" == typeof _.options.onRemoveNode && _.options.onRemoveNode({
                                                    node: q,
                                                    character: B
                                                }), q && q.parentNode.removeChild(q), H === m && I && n.unshift({
                                                    eventName: p,
                                                    eventArgs: {}
                                                });
                                            }
                                            break;
                                        case d:
                                            _.options.deleteSpeed = a.eventArgs.speed;
                                            break;
                                        case h:
                                            _.options.delay = a.eventArgs.delay;
                                            break;
                                        case y:
                                            _.options.cursor = a.eventArgs.cursor, _.state.elements.cursor.innerHTML = a.eventArgs.cursor;
                                    }
                                    _.options.loop && (a.eventName === p || a.eventArgs && a.eventArgs.temp || (_.state.calledEvents = [].concat(x(_.state.calledEvents), [
                                        a
                                    ]))), _.state.eventQueue = n, _.state.lastFrameTime = e;
                                }
                            }
                        }), t) if ("string" == typeof t) {
                            var g = document.querySelector(t);
                            if (!g) throw new Error("Could not find container element");
                            this.state.elements.container = g;
                        } else this.state.elements.container = t;
                        r && (this.options = w(w({}, this.options), r)), this.state.initialOptions = w({}, this.options), this.init();
                    }
                    var t, r;
                    return t = e, (r = [
                        {
                            key: "init",
                            value: function() {
                                var e, t;
                                this.setupWrapperElement(), this.addEventToQueue(y, {
                                    cursor: this.options.cursor
                                }, !0), this.addEventToQueue(c, null, !0), !window || window.___TYPEWRITER_JS_STYLES_ADDED___ || this.options.skipAddStyles || (e = ".Typewriter__cursor{-webkit-animation:Typewriter-cursor 1s infinite;animation:Typewriter-cursor 1s infinite;margin-left:1px}@-webkit-keyframes Typewriter-cursor{0%{opacity:0}50%{opacity:1}100%{opacity:0}}@keyframes Typewriter-cursor{0%{opacity:0}50%{opacity:1}100%{opacity:0}}", (t = document.createElement("style")).appendChild(document.createTextNode(e)), document.head.appendChild(t), window.___TYPEWRITER_JS_STYLES_ADDED___ = !0), !0 === this.options.autoStart && this.options.strings && this.typeOutAllStrings().start();
                            }
                        },
                        {
                            key: "logInDevMode",
                            value: function(e) {
                                this.options.devMode && console.log(e);
                            }
                        }
                    ]) && E(t.prototype, r), Object.defineProperty(t, "prototype", {
                        writable: !1
                    }), e;
                }();
            },
            9935: (e)=>{
                e.exports = function() {
                    return !1;
                };
            }
        }, r = {};
        function n(e) {
            var o = r[e];
            if (void 0 !== o) return o.exports;
            var a = r[e] = {
                id: e,
                loaded: !1,
                exports: {}
            };
            return t[e].call(a.exports, a, a.exports, n), a.loaded = !0, a.exports;
        }
        n.n = (e)=>{
            var t = e && e.__esModule ? ()=>e.default : ()=>e;
            return n.d(t, {
                a: t
            }), t;
        }, n.d = (e, t)=>{
            for(var r in t)n.o(t, r) && !n.o(e, r) && Object.defineProperty(e, r, {
                enumerable: !0,
                get: t[r]
            });
        }, n.g = function() {
            if ("object" == typeof globalThis) return globalThis;
            try {
                return this || new Function("return this")();
            } catch (e) {
                if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
                ;
            }
        }(), n.o = (e, t)=>Object.prototype.hasOwnProperty.call(e, t), n.nmd = (e)=>(e.paths = [], e.children || (e.children = []), e);
        var o = {};
        return (()=>{
            "use strict";
            n.d(o, {
                default: ()=>h
            });
            var e = n(9155), t = n.n(e), r = n(9905), a = n(2404), i = n.n(a);
            function s(e) {
                return s = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e) {
                    return typeof e;
                } : function(e) {
                    return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
                }, s(e);
            }
            function u(e, t) {
                for(var r = 0; r < t.length; r++){
                    var n = t[r];
                    n.enumerable = n.enumerable || !1, n.configurable = !0, "value" in n && (n.writable = !0), Object.defineProperty(e, v(n.key), n);
                }
            }
            function c(e, t) {
                return c = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function(e, t) {
                    return e.__proto__ = t, e;
                }, c(e, t);
            }
            function p(e) {
                if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
                return e;
            }
            function l() {
                try {
                    var e = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {}));
                } catch (e) {}
                return (l = function() {
                    return !!e;
                })();
            }
            function f(e) {
                return f = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function(e) {
                    return e.__proto__ || Object.getPrototypeOf(e);
                }, f(e);
            }
            function v(e) {
                var t = function(e) {
                    if ("object" != s(e) || !e) return e;
                    var t = e[Symbol.toPrimitive];
                    if (void 0 !== t) {
                        var r = t.call(e, "string");
                        if ("object" != s(r)) return r;
                        throw new TypeError("@@toPrimitive must return a primitive value.");
                    }
                    return String(e);
                }(e);
                return "symbol" == s(t) ? t : t + "";
            }
            var d = function(e) {
                !function(e, t) {
                    if ("function" != typeof t && null !== t) throw new TypeError("Super expression must either be null or a function");
                    e.prototype = Object.create(t && t.prototype, {
                        constructor: {
                            value: e,
                            writable: !0,
                            configurable: !0
                        }
                    }), Object.defineProperty(e, "prototype", {
                        writable: !1
                    }), t && c(e, t);
                }(d, e);
                var n, o, a = function(e) {
                    var t = l();
                    return function() {
                        var r, n = f(e);
                        if (t) {
                            var o = f(this).constructor;
                            r = Reflect.construct(n, arguments, o);
                        } else r = n.apply(this, arguments);
                        return function(e, t) {
                            if (t && ("object" == s(t) || "function" == typeof t)) return t;
                            if (void 0 !== t) throw new TypeError("Derived constructors may only return object or undefined");
                            return p(e);
                        }(this, r);
                    };
                }(d);
                function d() {
                    var e, t, r, n;
                    !function(e, t) {
                        if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function");
                    }(this, d);
                    for(var o = arguments.length, i = new Array(o), s = 0; s < o; s++)i[s] = arguments[s];
                    return t = p(e = a.call.apply(a, [
                        this
                    ].concat(i))), n = {
                        instance: null
                    }, (r = v(r = "state")) in t ? Object.defineProperty(t, r, {
                        value: n,
                        enumerable: !0,
                        configurable: !0,
                        writable: !0
                    }) : t[r] = n, e;
                }
                return n = d, (o = [
                    {
                        key: "componentDidMount",
                        value: function() {
                            var e = this, t = new r.default(this.typewriter, this.props.options);
                            this.setState({
                                instance: t
                            }, function() {
                                var r = e.props.onInit;
                                r && r(t);
                            });
                        }
                    },
                    {
                        key: "componentDidUpdate",
                        value: function(e) {
                            i()(this.props.options, e.options) || this.setState({
                                instance: new r.default(this.typewriter, this.props.options)
                            });
                        }
                    },
                    {
                        key: "componentWillUnmount",
                        value: function() {
                            this.state.instance && this.state.instance.stop();
                        }
                    },
                    {
                        key: "render",
                        value: function() {
                            var e = this, r = this.props.component;
                            return t().createElement(r, {
                                ref: function(t) {
                                    return e.typewriter = t;
                                },
                                className: "Typewriter",
                                "data-testid": "typewriter-wrapper"
                            });
                        }
                    }
                ]) && u(n.prototype, o), Object.defineProperty(n, "prototype", {
                    writable: !1
                }), d;
            }(e.Component);
            d.defaultProps = {
                component: "div"
            };
            const h = d;
        })(), o.default;
    })()); //# sourceMappingURL=react.js.map
}),
];

//# sourceMappingURL=_da018970._.js.map