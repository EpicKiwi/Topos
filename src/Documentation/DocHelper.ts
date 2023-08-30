const FUNCTION_REGEX = /^(?:([^. (]+)?(\.))?([^( ]+)(?:\(([^)]*)\)(?:\s*:\s*(\S+))?)?$/
const PARAMETER_REGEX = /^(\.\.\.)?([^ :]+)(?:\s*:\s*(.+))?$/

/**
 * Description of an argument in a function description
 */
interface ArgDescription {
    /**
     * Name of argument
     */
    name: string,

    /**
     * Type of data required
     */
    type?: string,

    /**
     * If this argument collects all parameters in an array
     */
    collect: boolean,

    /**
     * User firendly description of this argument
     */
    description?: string
}

/**
 * Description of an available function
 */
interface FunctionDescription {
    /**
     * Identifier of this function in hashmap
     */
    id: string,

    /**
     * name of this function
     */
    name: string,

    /**
     * User displayable of this function name
     */
    label: string,

    /**
     * Arguments of this description
     */
    args: ArgDescription[],

    /**
     * Type of data returned by this function
     */
    returnType?: string,

    /**
     * If this function is a method of an object
     */
    isMethod: boolean,

    /**
     * Object type this methods belongs to
     */
    methodOf: string
    
    /**
     * User friendly description of this function
     */
    description?: string
}

export default class DocHelper {

    functions: {[name: string]: FunctionDescription} = {}

    /**
     * Declare an available function
     * 
     * Returns doc code and add this function to the function database use in autocompletion
     * 
     * @param signature Function signature TypeScript style
     * @param description User firendly description of this function
     * @param parametersDescription User friendly description of this function arguments
     * @returns Markdown code for this function declaration
     */
    fn(
        signature: string,
        description?: string,
        parametersDescription:string[]|{[name:string]: string} = []
    ) : string {
        let result = signature.match(FUNCTION_REGEX);

        let id = null;

        if(result){
            let [_, methodOf, methodPoint, name, rawArgs, returnType] = result;

            let args:ArgDescription[] = []
            if(rawArgs){
                args = rawArgs.split(",")
                    .map(it => it.trim().match(PARAMETER_REGEX) || it)
                    .map((it, i) => {
                        if( typeof it == "string" ) {
                            return {
                                name: it,
                                type: undefined,
                                collect: false,
                                //@ts-ignore
                                description: parametersDescription[it] || parametersDescription[i]
                            }
                        } else {
                            return {
                                name: it[2],
                                type: it[3],
                                collect: !!it[1],
                                //@ts-ignore
                                description: parametersDescription[it[2]] || parametersDescription[i]
                            }
                        }
                    });
            }

            let fn:FunctionDescription = {
                id: (methodPoint||"")+""+name,
                name,
                label: (methodPoint || "")+""+name,
                args,
                returnType,
                isMethod: !!methodPoint,
                methodOf,
                description
            }

            // Only add ID on first occurence of function in doc
            if(!this.functions[fn.id]){
                id = fn.id
                this.functions[fn.id] = fn;
            }
        }

        return `<icode ${id ? `id="doc-fn-${id}"` : ""} ${description ? `title="${description}"` : ""}>${signature}</icode>`
    }

}