import _ from 'lodash';

export default async (keys, { Suggestion }) => {
    // keys = [1, 2, 3, ... ] got from the Board resolver
    const suggestions = await Suggestion.findAll({
       raw: true,
       where: {
           boardId: {
               $in: keys
           }
       } 
    });
    
    //transforms suggestions array 
    //from: suggestions = [{boardId: 1, text:'hi'}, ...]
    //to: gs = {1: [{text: 'hi', boardId: '1'}], 2: [{text: 'hello', boardId: '2'}, {text: 'sfssda', boardId: '2'}]}
    const gs = _.groupBy(suggestions, 'boardId'); 

    return keys.map(k => gs[k] || []);
}