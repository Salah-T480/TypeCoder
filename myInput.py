word=['algorithm', 'api ', 'argument', 'array', 'binary ',
            'bit', 'boolean', 'bug', 'class', 'comment',
            'compiler', 'computer ', 'data', 'debug', 'default', 
            'function', 'grid', 'host', 'input', 'java', 
            'linux', 'load', 'loop', 'memory', 'operator',
            'output', 'program', 'python', 'query', 'queue',
            'save', 'script','select', 'stack', 'statement',
            'string', 'system', 'terminal', 'types', 'ubuntu',
            'variable', 'virtual']

def Fil(e):
    return 5<=len(e)

hard=['<type_traits>', 'assert()', 'auto&', 'bfs', 'binary_search','dfs', 'dijkstra', 'dynamic_programming', 'emplace_back()', 'explicit', 'getelementbyid()', 'java.util.scanner', 'Math.floor()', 'Math.min(x,y)', 'Math.sqrt(x)', 'namespace', 'pd.read_csv()', 'push_back()', 'quicksort', 'resize()', 'shrink_to_fit()', 'static_assert()', 'static_cast<double>', 'std::array', 'std::int32_t', 'std::numeric_limits<>', 'std::out_of_range', 'std::ptrdiff_t', 'std::ptrdiff_t', 'std::reference_wrapper', 'std::size_t', 'std::sqrt', 'std::ssize()', 'std::streamsize', 'std::string', 'std::string_view', 'std::vector<bool>', 'std::vector<int>', 'String[]', 'System.out.println()', 'tolowercase()', 'touppercase()', 'usecallback()', 'useeffect()', 'usereducer()', 'usestate()']
print(len(hard))
def myFilter():
    hard=list(filter(lambda x:Fil(x),hard))
    hard.sort()
    print(hard)
    
def FillTheList(array:list):
    for _ in range(20):
        array.append(input().strip().lower())
    array.sort()
    print(array)

FillTheList(hard)
