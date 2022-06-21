//
const xor = require("buffer-xor");

//
const bufferPaddingGenerator = (buffer, count) => {
    let result = buffer;
    for (let i = 0; i < count; i++)
    {
        result = Buffer.concat([result, Buffer.alloc(1)]);
    }

    return result;
};

const xorGenerator = (previous, now) => {
    const previousLength = previous.length;
    const nowLength = now.length;

    if (previousLength < nowLength)
    {
        const filledPrevious = bufferPaddingGenerator(previous, nowLength - previousLength);
        return xor(filledPrevious, now);
    }
    else if (previousLength > nowLength)
    {
        const filledNow = bufferPaddingGenerator(now, previousLength - nowLength);
        return xor(previous, filledNow);
    }
    else
    {
        return xor(previous, now);
    }
};

module.exports.rightSignBufferGenerator = (note) => {
    if (note.length === 1)
    {
        return Buffer.from(JSON.stringify(note[0]));
    }

    return note.reduce((sum, element, currentIndex) => {
        const previous = currentIndex === 1 ? Buffer.from(JSON.stringify(sum)) : sum;
        const now = Buffer.from(JSON.stringify(element));
  
        return xorGenerator(previous, now);
    });
};

module.exports.leftSignBufferGenerator = transfer => {
    return Buffer.from(
        transfer.Revision.toString()
        + transfer.PreviousKeyID
        + transfer.ContractCreateTime
        + transfer.Fintech.toString()
        + transfer.From
        + transfer.Balance
        + transfer.NotePrivacy.toString()
    );
};

//
module.exports.signBufferGenerator = (transfer) => {
    return Buffer.from(
        transfer.create_tm
        + transfer.fintech
        + transfer.privacy
        + transfer.fee
        + transfer.from_account
        + transfer.to_account
        + transfer.action
        + JSON.stringify(transfer.contents)
        + transfer.memo
    );
};

//
module.exports.countryCode = (code) => {
    if (code === 'KR')
        return '60';
    else if (code === 'CN')
        return '61';
}