//Finds any GitHub Flavored MD
const GfmdRE = /(?:[_*~]{1,3}|#+ .+\n|[-*+] .+\n)/
//REs corresponding to HyperMD options and addons
const HmdAddonREs = {
  "hmdTableAlign_/": /\|\n(?:\| ?-\-+ ?)+\|?\n\|/,
  "hmdFoldCode_/": /(~~~+|```+)[ \t]*([\w+#-]*)[^\n`\\]*/,
  "/_hmdFold:emoji": /:\w+:/,
  "/_hmdFold:math": /\${1,2}.+\${1,2}/,
  "hmdFoldHTML_hmdFold:html": /<\w+ ?.*\/?>/,
  "hmdFoldLink_hmdFold:link": /[.*] *(.+)/,
  "/_hmdFold:image": /!\[.*\] *\(.+\)/,
  "hmdHover_/": /(\[[\w\d^]*\])(?:.|\n)*\1:/,
  "/_mode:hashtag": /(?:#[\w\d]+#?|#[\w\d ]#)/,
};

const DEFAULT_HMD_OPTIONS = {
  //CodeMirror Options
  mode: { name: "hypermd", hashtag: false },
  theme: "hypermd-light",
  lineNumbers: false,
  lineWrapping: true,
  smartIndent: true,
  readOnly: false,

  //Hmd Specific Options
  hmdHideToken: true,
  hmdPaste: false,
  hmdClick: true,
  hmdFold: {},
  hmdHover: false,

};

//package requirements dependant on HyperMD options and addons
const HmdPackageRequirements = {
  essentials: new Set([
    "codemirror/lib/codemirror",
    "codemirror/mode/yaml/yaml",
    "hypermd/core",
    "hypermd/mode/hypermd"
  ]),

  default_addons: new Set([
    "hypermd/addon/hide-token",
    "hypermd/addon/cursor-debounce"
  ]),

  editor_only: new Set([
    "hypermd/keymap/hypermd",
    "hypermd/addon/insert-file",
    "hypermd/addon/paste",
    "hypermd/powerpack/paste-with-turndown",
    "turndown-plugin-gfm"
  ]),

  "hmdTableAlign_/": new Set(["hypermd/addon/table-align"]),
  all_folding: new Set(["hypermd/addon/fold"]),

  "hmdFoldCode_/": new Set(["hypermd/addon/mode-loader"]),
  "hmdFoldEmoji_hmdFold:emoji": new Set([
    "hypermd/addon/fold-emoji",
    "hypermd/powerpack/fold-emoji-with-emojione"
  ]),
  "hmdFoldMath_hmdFold:math": new Set([
    "codemirror/mode/stex/stex",
    "hypermd/addon/fold-math",
    "hypermd/powerpack/fold-math-with-katex"
  ]),
  "hmdFoldHTML_hmdFold:html": new Set([
    "codemirror/mode/htmlmixed/htmlmixed",
    "hypermd/addon/fold-html"
  ]),
  "hmdFoldLink_hmdFold:link": new Set([
    "hypermd/addon/fold-link",
    "hypermd/addon/read-link"
  ]),
  "/_hmdFold:image": new Set(["hypermd/addon/fold-image"]),
  "hmdHover_/": new Set([
    "hypermd/addon/hover",
    "hypermd/powerpack/hover-with-marked"
  ]),
  "/_mode:hashtag": new Set(["hypermd/addon/click"]),
};

function getHyperMDOptions(raw_text, required_packages = {}, overrides = {}) {
  var hmdOptions = { ...DEFAULT_HMD_OPTIONS };
  var foundMD = false;

  for (let [hmdOptionKeys, re] of Object.entries(HmdAddonREs)) {
    //use addon if MD that requires it is found in raw_text  
    let useAddon = re.exec(raw_text) !== null;
    if (useAddon){
        foundMD = true
        required_packages[hmdOptionKeys] = true
    }

    //set HyperMD options
    var keys = hmdOptionKeys.split("_");
    if (keys[0] !== "/") {
      hmdOptions[keys[0]] = useAddon;
    }
    if (keys[1] !== "/") {
      let [outer_key, inner_key] = keys[1].split(":");
      hmdOptions[outer_key][inner_key] = useAddon;
    }
  }

  //Check for Regular Github flavored MD if no other MD was found
  if (!foundMD){
      foundMD = GfmdRE.exec(raw_text)
  }

  return [{ ...hmdOptions, ...overrides }, foundMD];
}

function getRequiredPackageScripts(required_packages, imported_packages){
    for (let pkg_group_key of Object.keys(required_packages)){
        if (!imported_packages.includes(pkg_group_key)&&HmdPackageRequirements[pkg_group_key]){
            imported_packages.push(pkg_group_key)
            for (let pkg_path of HmdPackageRequirements[pkg_group_key]){
                
                //This is we would dynamically import neccessary packages
                console.log("requirejs: "+pkg_path)
            }
        }
    }
}

export {getHyperMDOptions, getRequiredPackageScripts}
