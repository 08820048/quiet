# Java集合源码浅析

**摘要**：集合主要分为两组：单列集合和双列集合

但列集合一般是指存放单个对象的集合，而双列集合一般是以<k,v>键值对形式存放数据的集合。



**分类**：Java

**标签**：后端, Java

**发布时间**：2025-08-14T12:03:20

---



### 更新日志🎉

2023-01-29 星期六
> - 修正一些已知错误
> - 调整文章布局结构
> - 修正错别字词

2022-05-26 10:20:23 星期四

> - 修正语言表达逻辑
> - 删除/修改了错别字词
> - 更新了部分配图

2022-08-02

> - 修正错别字
> - 修正语言表达逻辑

2022-08-22

> - 还是修已知的正错别词语

---

---

Java集合解读

## IDEA快捷键

> 查看源码:F4
>
> 进入实现:Ctrl+Alt+B(鼠标点击)
>
> 添加实现类:空格
>
> 显示图:Ctrl+Alt+Shift+U

## 概览

说明：以下内容的源码分析，如没有特别说明，均来自JDK8.

> 1. 集合主要分为两组：单列集合和双列集合
>
>    > 但列集合一般是指存放单个对象的集合，而双列集合一般是以<k,v>键值对形式存放数据的集合。
>
> 2. `Collection`接口下有两个重要的子接口`List`,`Set`，他们的实现子类都是单列集合。
>
> 3. `Map`接口的实现子类有`HashTable`、`HashMap`、`TreeMap`,也都是双列集合。
>
> 4. 以下是集合类下两大主接口的类图关系。

### **Collection系**

![](https://images.waer.ltd/img/20220525092920.png)

> 在Conllection接口下，派生出了三个主要的子接口，分别为无序集合`Set`,队列`Queue`和有序集合`List`。在三大子接口之下，还有着众多的实现子类或者派生的子接口，其中最常用的有：

- TreeSet
- LinkedHashSet
- HashSet
- LinkedList
- ArrayList
- Stack

****

### **Map系**

![](https://images.waer.ltd/img/20220525092947.png)

> `Map`集合为双列集合。`Map`**没有直接继承的子接口,**主要有三个实现类，分别是`HashMap`、`HashTable`、`SortedMap`。在三个主要实现之下，比较常用的实现及其实现子类有：
>
> - `HashMap`(性能高，非线程安全)
> - `Hashtable`(性能较低，线程安全，但属于老旧的API，一般不推荐使用)
> - `TreeMap`(有序`map`)

****

## 细说

### `Collection`

由于`Collection`接口直接继承了`Iterable`，它是没有实现的，它的所有方法都是由它的**子接口**的实现类进行实现，所以这里就以`Collection`下子接口`List`的实现类`ArrayList`来讲解。注意`List`是**有序集合且元素可以重复**，而`Set`则是**无序集合，元素不可重复**。

**讲解的方法列表**

> - add:添加单个元素
> - remove：输出指定元素
> - contains:查找元素是否存在
> - size:获取元素个数
> - isEmpty:判断是否为空
> - clear:清空
> - addAll:添加多个元素
> - containsAll:查找多个元素是否都存在
> - removeAll:输出多个元素

**基本用法演示**

```java
List list = new ArrayList();
/*添加单个元素*/
list.add("Jack");
//这里其实是一个自动装箱的操作:list.add(new Integer(10))
list.add(10);
list.add(true);
System.out.println("list:"+list);

/*输出元素*/
//输出"Jack"
//list.remove(0);
//指定输出某个元素
list.remove(true);
System.out.println("输出后的[list]:"+list);

/*查找某个元素是否存在*/
//true
System.out.println(list.contains("Jack"));

/*获取元素个数*/
//2
System.out.println(list.size());

/*判断集合是否为空*/
//false
System.out.println(list.isEmpty());

/*清空集合*/
list.clear();
//清空后的[list]：[]
System.out.println("清空后的[list]："+list);

/*添加多个元素*/
ArrayList list2 = new ArrayList();
list2.add("西游记");
list2.add("西厢记");
list.addAll(list2);
//添加多个元素后的[list]:[西游记, 西厢记]
System.out.println("添加多个元素后的[list]:"+list);

/*判断多个元素是否都存在*/
//true
System.out.println(list.containsAll(list2));

/*输出多个元素*/
list.add("华强北");
//true
System.out.println(list.removeAll(list2));
//华强北
System.out.println(list);
```

**遍历用法**

> 上面的类图已经知道，`Collection`接口还有一个`Iterable`父接口。它的部分实现源码中第一个方法如下:
>
> ![](https://images.waer.ltd/img/20220320114101.png)
>
> 可以看到，该方法可以返回元素的`iterator`对象。只要是实现了接口的所有子类，都有一个`iterator()`方法。在对元素的遍历上，都可以采用迭代器的方式进行遍历。所以`Collection`**及其所有子类实现**，我们都可以获取到每个元素的迭代器并用在对元素的遍历操作上。需要注意的是，`iterator`**仅用来遍历集合，本身并不存放任何对象。** 

**迭代器的执行原理**

> 作为`Collection`的父接口，`Iterator`的方法如下：
>
> ![](https://images.waer.ltd/img/20220320141211.png)
>
> 

> 我们一般在使用迭代器进行遍历的时候，都会用到一个`while`循环，循环的条件是`iterator.hasNext()`，也就是说，在每次得到遍历元素之前，`iterator`对象会调用自身的`hasNext()`方法，对集合里的元素进行判断，**只有当存在下一个元素时，迭代器才会继续往下执行**，否则，迭代结束。
>
> ![](https://images.waer.ltd/img/20220320140135.png)
>
> 可以看到，`Iterator`的`hasNext()`方法返回一个**布尔值**，如果该迭代对象还存在元素的情况下。这个方法就相当于一个指向集合元素的指针，每一次调用都会向下移动以检查**是否到达集合尾部**，在移动的同时，它还会调用`next()`方法，该方法会将移动后该指针指向位置上的元素进行返回。为了有效的防止空指针，每次在调用`Next()`之前，会先调用`hasNext()`,这是有必要的。如果说不存在下一个元素，则会抛出一个`NoSuchElementException`异常。

**Iterator使用示例**

```java
package collection;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Iterator;

/**
 * @author: 八尺妖剑
 * @date: 2022/3/20 14:17
 * @description: 演示迭代器[Iterator]的使用
 * @blog:www.waer.ltd
 */
@SuppressWarnings({"all"})
public class CollectionIterator {
    public static void main(String[] args) {
        Collection col = new ArrayList();
        col.add(new Book("C++ Primer Plus","Stephen Prata",57.4));
        col.add(new Book("程序员的数学","结城浩",20.5));
        col.add(new Book("Java疯狂讲义","李刚",80.7));

        System.out.println("集合[col]:"+col);
        /*遍历集合*/
        //1.获取集合的迭代对象
        Iterator iterator = col.iterator();
        //2.while循环遍历数据
        while(iterator.hasNext()){
            //3.注意：iterator返回默认时一个Object类型(除非指定泛型)
            Object o = iterator.next();
            System.out.println("[col]迭代返回:"+o);
        }
        //4.当退出while循环之后，此时的iterator指向最后一个元素，在调用next()方法会报NoSuchElementException异常。
        //如果需要再次遍历，需要重置迭代器。方法如下：
        //IDEA支持快速生成迭代方法，使用[Ctrl+j]快捷键进行查看
        iterator = col.iterator();
        while (iterator.hasNext()) {
            Object o1 =  iterator.next();
            System.out.println("[col]再次迭代："+o1);
        }
    }
}

/**
 * 内部类
 */
class  Book{
    private String name;
    private String author;
    private double price;

    public Book(String name, String author, double price) {
        this.name = name;
        this.author = author;
        this.price = price;
    }

    @Override
    public String toString() {
        return "Book{" +
                "name='" + name + '\'' +
                ", author='" + author + '\'' +
                ", price=" + price +
                '}';
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getAuthor() {
        return author;
    }

    public void setAuthor(String author) {
        this.author = author;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }
}
```

> 一些需要注意的点，已经写在了注释当中。

**增强for**

> 所谓增强for，也就是针对普通for循环的增强。它可以替代`iterator`迭代器，相当于一个简化版的`iterator`,也正因为如此，**增强for只能用于遍历集合或者数组**。

基本语法：

```java
for(元素类型 元素名:集合或者数组名){
    访问元素;
}
```

```java
package collection;

import java.util.ArrayList;
import java.util.Collection;

/**
 * @author: 八尺妖剑
 * @date: 2022/3/20 14:56
 * @description: 演示增强for的使用
 * @blog:www.waer.ltd
 */
public class CollectionFor {
    @SuppressWarnings({"all"})
    public static void  main(String[] args) {
        Collection col = new ArrayList();
        col.add(new Book("C++ Primer Plus","Stephen Prata",57.4));
        col.add(new Book("程序员的数学","结城浩",20.5));
        col.add(new Book("Java疯狂讲义","李刚",80.7));

        /*使用增强for进行集合的遍历*/
        for(Object book:col){
            System.out.println("book="+book);
        }
    }
}
```

#### `List`接口

**常用实现及其方法一览**

![](https://images.waer.ltd/img/Lists.png)

> `List`接口是`Collection`的子接口，上面讲解的`ArrayList`的方法是来自`Collection`接口方法。而这些方在`Set`子接口中也可以使用。下面讲一下子接口`List`中的实现类，也是以`ArrayList`实现为例。

> - `List`集合类中的元素是有序(添加和取出顺序一致)的，且是可重复的。
> - `List`集合中的每一个元素都有其对应的顺序索引，即他是支持**索引**的一类集合。
> - `List`中的元素都对应一个整数型的序号记载其在容器中的位置，可以根据序号存取容器中的元素。
> - `List`子接口的主要常用实现类有`ArrayList`、`LinkedList`、`Vector`。

**List的一些方法**

```java
package List;

import java.util.ArrayList;
import java.util.List;

/**
 * @author: 八尺妖剑
 * @date: 2022/3/20 16:57
 * @description: List的方法演示
 * @blog:www.waer.ltd
 */
public class ListMethod {
    @SuppressWarnings({"all"})
    public static void main(String[] args) {
        List list =new ArrayList();
        list.add("张无忌");
        list.add("张天志");
        /*在index位置插入元素e*/
        /*注意：这里如果不指定下标的话，默认是以尾部追加的方式进行元素插入的*/
        list.add(1,"Tisox");
        //list=[张无忌, Tisox, 张天志]
        System.out.println("list="+list);

        /*addAll(inr index,Collection e)：从index位置开始将元素e中的所有元素添加进来*/
        List list2 =new ArrayList();
        list2.add("蜘蛛侠");
        list2.add("钢铁侠");
        list.addAll(1,list2);
        //list=[张无忌, 蜘蛛侠, 钢铁侠, Tisox, 张天志]
        System.out.println("list="+list);
        /*int intdexOf(Object obj):返回obj在当前集合中首次出现的位置*/
        System.out.println(list.indexOf("蜘蛛侠"));

        /*int lastIndexOf(Object obj):返回obj在当前集合中最后一次出现的位置*/
        list.add("凋残");
        System.out.println(list.lastIndexOf("凋残"));

        /*remove(int index):移除指定index位置的元素，并返回此元素*/
        list.remove(0);
        System.out.println("list="+list);

        /*set(int index,Object ele):设置指定index位置出的元素为ele，相当于是替换元素*/
        list.set(1,"新的名字");
        System.out.println("list="+list);

        /*subList(int fromIndex,int toIndex):返回从fromIndex到toIndex位置的子集合*/
        //返回一个左闭右开的区间
        List reslist = list.subList(0, 2);
        System.out.println("relist="+reslist);
    }
}
```

**List的三种遍历方式**

> 由于`ArrayList`、`LinkedList`和`Vector`都是`List`的实现子类，以下方法可以**无缝切换**，效果是一样的。

```java
package List;

import java.util.*;

/**
 * @author: Tisox
 * @date: 2022/3/20 19:18
 * @description: List的三种遍历方式
 * @blog:www.waer.ltd
 */
public class ListFor {
    @SuppressWarnings({"all"})
    public static void main(String[] args) {
        //List list =new Vector();
        List list = new LinkedList();
        //List list = new ArrayList();
        list.add("jack");
        list.add("tom");
        list.add("回锅肉");
        list.add("鱼香肉丝");
        list.add("砂锅粉");

        /*1.迭代器遍历*/
        Iterator iterator = list.iterator();
        while (iterator.hasNext()) {
            Object next = iterator.next();
            System.out.println("[list]的[迭代器iterator]遍历="+list);
        }
        System.out.println("====================================");
        /*2.增强for遍历*/
        for (Object o : list) {
            System.out.println("[list]的[增强for]遍历="+list);
        }
        System.out.println("====================================");
        /*3.普通for循环遍历*/
        for(int i=0;i<list.size();i++){
            System.out.println("[list]的[普通for循环]遍历="+list.get(i));
        }
    }
}
```

####  `ArrayList`

- `ArrayList`**允许存入`null`值。**

```java
ArrayList arrayList = new ArrayList();
arrayList.add(null);
arrayList.add("");
arrayList.add("Java");
System.out.println(arrayList);
```

- 底层采用数组实现。

- `ArrayList`线程不安全

![](https://images.waer.ltd/img/20220320204436.png)

> 通过它的源码可以看到，他是没有`synchronized`关键字修饰的。也正是因为如此，它的效率是比较高的，所以如果需要保证线程安全的场景下，不建议使用`ArrayList`。

##### 源码分析

**`ArrayList`中维护了一个`Object`类型的数组`elementData[]`。**源码如下:

```java
transient Object[] elementData; 
```

这里的`elementData[]`数组的类型是`Object`类型，也就是说，它可以存放任意类型的数据，因为`Object`类是**所有类的父类**，也就是顶级父类。 关键字`transient`的作用是去除序列化，当某个属性被加上该关键字即表示它在进行序列化时会被忽略，不参与序列化操作。

##### 底层扩容原理

> `ArrayList`底层采用数组这种数据结构来实现，必然会有容量的限制，那么在它的底层是如何实现自动扩容的呢？这里以其中的`add()`方法进行浅析。

`ArrayList`有两个构造方法，分别是**无参数构造和有参构造**。下面是源码

```java
//无参构造
public ArrayList() {
    this.elementData = DEFAULTCAPACITY_EMPTY_ELEMENTDATA;
}
//有参构造
public ArrayList(int initialCapacity) {
    if (initialCapacity > 0) {
        this.elementData = new Object[initialCapacity];
    } else if (initialCapacity == 0) {
        this.elementData = EMPTY_ELEMENTDATA;
    } else {
        throw new IllegalArgumentException("Illegal Capacity: "+
                                           initialCapacity);
    }
}
```

两个构造方法不仅在参数上有所区别，他们的底层扩容原理也是不一样的，先看一下无参数的` ArrayList()`构造。

可以看到，在**无参构造的方法**中，它将数组的初始容量设为`DEFAULTCAPACITY_EMPTY_ELEMENTDATA`。也就是一个空对象数组。这一点可以从下面的源码得知。

![](https://images.waer.ltd/img/20220321195749.png)

下面尝试在集合中添加元素，来分析add方法的执行过程。

```java
//使用无参构造对集合进行初始化
ArrayList list = new ArrayList();
//向其中添加10个元素
for (int i = 1; i <= 10; i++) {
    list.add(i);
}
```

**执行过程和扩容原理**

- 在初始化完成后，当我们触发add()时，它会先调用`valueOf()`方法对添加的元素进行一个**装箱**操作，这不是本次分析的重点，不再赘述。注意下面这个自动装箱的源码来自**JDK11**

![](https://images.waer.ltd/img/20220321200829.png)

- 装箱结束后，进入`add(E e)`这个方法，该方法是集合中的一个**重载方法，接收一个泛型参数**，源码如下:

  ```java
  public boolean add(E e) {
      ensureCapacityInternal(size + 1);  // Increments modCount!!
      elementData[size++] = e;
      return true;
  }
  ```

首先，在执行正式的添加操作之前，会先执行`ensureCapacityInternal()`方法，该方法主要是用来**确认集合的容量情况**，决定是否需要扩容。再调用添加方法进行元素的添加。显然，这里出现的`ensureCapacityInternal()`方法是重点，源码如下：

```java
private void ensureCapacityInternal(int minCapacity) {
    if (elementData == DEFAULTCAPACITY_EMPTY_ELEMENTDATA) {
        minCapacity = Math.max(DEFAULT_CAPACITY, minCapacity);
    }
    ensureExplicitCapacity(minCapacity);
}
```

方法传入一个名为`minCapacity`的`int`类型变量，表示数组最小容量。接着判断`elementData`是否是`DEFAULTCAPACITY_EMPTY_ELEMENTDATA`默认值，由于我们选择的是无参构造，所以`if`语句中的条件是成立的。接下来`Math.max(DEFAULT_CAPACITY, minCapacity)`在**默认容量**和**最小容量**之间取一个最大值并赋给`minCapacity`，也就是更新`minCapacity`的值。关于默认容量`DEFAULT_CAPACITY`，下面是它的声明：

```java
private static final int DEFAULT_CAPACITY = 10;
```

执行之后，`minCapacity`的值将更新为10;也就是说，这个方法目的是为了确认`minCapacity`的值，而在`if`之后，又出现了一个`ensureExplicitCapacity(minCapacity)`方法，在`if`判断条件不满足的情况下执行，参数就是上面更新后的`minCapacity`，可以猜测，这个方法应该也是对是否需要扩容进行一个判断的算法。

```java
private void ensureExplicitCapacity(int minCapacity) {
    modCount++;
    // overflow-conscious code
    if (minCapacity - elementData.length > 0)
        grow(minCapacity);
}
```

注意,这里有一条为`modCount++;`的语句，他主要是记录当前集合被修改的次数，为了防止被多个线程操作，否则会抛异常。第4行中if的条件`minCapacity - elementData.length > 0`表示最小容量与当前数组元素容量的一个**差值大于0是否成立**，将会直接调用下一个方法进行扩容，也就是`grow()`方法。

> 比方说，此时的`minCapacity=10`，`elementData=0`,显然`10-0>0`,也即是说，数组需要一个最小容量为10空间，而此时的容量为0，显然需要进行扩容操作。

下面是`grow()`方法，也是扩容的核心实现。

```java
private void grow(int minCapacity) {
    // overflow-conscious code
    int oldCapacity = elementData.length;
    int newCapacity = oldCapacity + (oldCapacity >> 1);
    if (newCapacity - minCapacity < 0)
        newCapacity = minCapacity;
    if (newCapacity - MAX_ARRAY_SIZE > 0)
        newCapacity = hugeCapacity(minCapacity);
    // minCapacity is usually close to size, so this is a win:
    elementData = Arrays.copyOf(elementData, newCapacity);
}
```

可以看到，方法开始会先将数组容量`elementData.length`赋值给一个中间变量`oldCapacity`。接着为变量`newCapacity`进行赋值，算法是将`oldCapacity`旧**的容量+旧容量的二分之一**赋值给该变量。注意这里`(oldCapacity >> 1)`表将`oldCapacity`右移一位，**等同于除以2**，用位运算可以提高执行效率。反过来，如果是左移的话，代表乘以`2`。

又由于前面已经知道`elemenatData`其实是等于`0`的，那么直接导致这条赋值语句结果为`0`，也就是`newCapacity==0`，所以它后面紧接着出现了两个判断。

> 1. 如果新的容量小于最小容量，那么将最小容量赋给这个新容量，**完成一次扩容，此时数组的容量由0变为10.**
> 2. 如果`newCapacity > MAX_ARRAY_SIZE `,那么`newCpapcity`的值由方法`hugeCapacity()`决定。这个后面再说，我们继续当前的分析，在执行完上面的判断语句之后，最后对`elemantData`进行重新赋值，核心方法`Arrays.copyOf(elementData, newCapacity)`,该方法的作用是将`newCapacity`的值复制给`elementData`。之后`elementData`里面将会存在**10个null**值.

就是说，当我们**首次**使用该集合的**无参构造**初始化集合时，其实并不会触发**1.5倍的底层扩容机制**。注意，这里使用`copyOf()`方法的作用也是为了**保留扩容之前已经存在集合中的元素**，换句话说，每次扩容并不会导致已存在的元素丢失，而是在这些元素之后添加`N`个值为`null`的元素空间。比如这样:

```java
//null值得位置就是扩容的容量
{1,2,3,4,5,6,7,8,9,10,null,null,null,null,null}
```

当以上扩容操作完成之后，执行会返回到之前的`add()`方法：

```java
public boolean add(E e) {
    ensureCapacityInternal(size + 1);  // Increments modCount!!
    elementData[size++] = e;
    return true;
}
```

此时的`elementData`已经由最初的空数组扩容为大小为10的容量，当执行完`elementData[size++] = e;`之后，新的容量中第一个位置会被替换为元素`1`:

```java
[1,null,null,null,null,null,null,null,null,null]
```

> 注意理解**minCapacity**和**elementData**的含义。前者的意思时我们用这个集合存放某些元素**最少需要的空间**，而后者表示此时这个集合**本身拥有的空间**，所以，扩容的目的在于扩张**elementData**的大小，以满足存放**minCapacity**所需。

现在来看一下上面留下的**hugeCapacity(minCapacity)**方法，源码如下：

```java
private static int hugeCapacity(int minCapacity) {
 if (minCapacity < 0) // overflow
     throw new OutOfMemoryError();
 return (minCapacity > MAX_ARRAY_SIZE) ? Integer.MAX_VALUE : MAX_ARRAY_SIZE;
}
//注意：以下是MAX_ARRAY_SIZE的常量定义。
private static final int MAX_ARRAY_SIZE = Integer.MAX_VALUE - 8;
//2147483647是Integer.MAX_VALUE
```

这个方法其实就是对数组**大小边界进行一个判断和限制**，要求数组大小在`0`到`MAX_VALUE`之间。如果`<0`直接抛出一个`OutOfMemoryError`异常，否则返回一个值作为数组容量的上限，这里用了一个三元表达式作为返回语句。

如果`最小容量大于MAX_ARRAY_SIZE，`则将`Integer.MAX_VALUE`的值赋给它，否则还是用`MAX_ARRAY_SIZE。`

再看一下**为什么这里****MAX_ARRAY_SIZE**是**Integer.MAX_VALUE-8**，也即是**2147483647-8=2,147,483,639****而不是减其他数值？**关于这个问题，其实再源码的注释中就已经写清楚了。

![](https://images.waer.ltd/img/20220322112254.png)

大致意思就是如果直接使用**Integer.MAX_VALUE**的话，在某些虚拟机中，可能会出现溢出的问题。不过一般情况下，我们还是认为它的值可以直接看作是与**Integer.MAX_VALUE**相同。以下是来自`stackoverflow`的一个解答，可以参考一下。

[Why the maximum array size of ArrayList is Integer.MAX_VALUE - 8?](https://stackoverflow.com/questions/35756277/why-the-maximum-array-size-of-arraylist-is-integer-max-value-8)

**有参构造的扩容原理**

上面分析了调用**无参构造器**创建集合后，它底层的扩容原理，其实只要理解了之后。那么关于**有参构造**的扩容，就很容易理解了。

下面是它的有参构造器源码，前面也提到过。

```java
/**
     * Constructs an empty list with the specified initial capacity.
     *
     * @param  initialCapacity  the initial capacity of the list
     * @throws IllegalArgumentException if the specified initial capacity
     *         is negative
     */
public ArrayList(int initialCapacity) {
    if (initialCapacity > 0) {
        this.elementData = new Object[initialCapacity];
    } else if (initialCapacity == 0) {
        this.elementData = EMPTY_ELEMENTDATA;
    } else {
        throw new IllegalArgumentException("Illegal Capacity: "+initialCapacity);
    }
}
```

这段代码很容易理解，我们在调用该构造器进行初始化时传入一个初始大小`initialCapacity`作为数组的**初始容量**。如果该容量**大于0，**此时`elementData`数组会直接**用该值作为数组的长度创建一个新的`Object`数组，以完成初始化**。否则如果传入的初始值为`0`，会对`elementData`进行一个常量赋值操作，将数组初始化为`EMPTY_ELEMENTDATA`大小的数组，该常量定义如下：

```java
private static final Object[] EMPTY_ELEMENTDATA = {};
```

也就是创建一个空数组。如果不在以上两种情况之外的，直接抛一个**IllegalArgumentException**异常结束。但是一般情况下，既然我们决定调用了该构造器，一般不会直接甩个`0`进去，这样做的意义不大。

在初始化完成后，进入添加方法，方法会先对现有的数组容量进行检查，如果发现所**需最小容量大于当前初始化传入的容量**，则会先进入`grow()`方法完成扩容，这里扩容不会进入第一个`if`判断，因为初始化传入的`elementData`**必然是大于0的**，程序会直接执行源码中的**int newCapacity = oldCapacity + (oldCapacity >> 1);**这行逻辑，**直接采取1.5倍扩容的机制**对数组进行扩容后，将扩容后的整个数组空间直接复制一份，该操作会在原有元素的基础上追加扩容部分的空间，**该部分的值默认使用null来填充**，这些和前面分析**无参构造扩容**时候是一样的。此时再返回添加方法内部执行添加，添加成功之后之前扩容的`null`部分会被刚添加的元素取代，以此类推，直到下一次容量不够时，又再一次触发`1.5`b倍的扩容机制。

```java
private void grow(int minCapacity) {
 // overflow-conscious code
 int oldCapacity = elementData.length;
 int newCapacity = oldCapacity + (oldCapacity >> 1);
 if (newCapacity - minCapacity < 0)
     newCapacity = minCapacity;
 if (newCapacity - MAX_ARRAY_SIZE > 0)
     newCapacity = hugeCapacity(minCapacity);
 // minCapacity is usually close to size, so this is a win:
 elementData = Arrays.copyOf(elementData, newCapacity);
}
```

**实例演示**

通过一个具体的例子，来解释帮助理解上面所说的扩容原理(无参构造)。

- **无参构造器**

> 假设我们调用 了`ArrayList()`对集合`list`进行了初始化并尝试向其中添加元素，下面模拟这个大致过程：
>
> 1. 初始化完成，创建一个空的对象数组`elementData[] = {}`。
> 2. 进入`add()`方法，根据当前添加元素所需空间对已有空间进行判断，显然我们添加第一个元素时，`minCapacity=1,`而`elementData=0。`
> 3. 此时不忙着执行添加，而是调用`ensureCapacityInternal()`方法：
>    1. 该方法发现，初始化的`elementData=DEFAULTCAPACITY_EMPTY_ELEMENTDATA`，则执行一个`Math.max()`方法，该方法直接将`minCapacity`的值改为`10`。此时我们的`minCapacity=10`,而`elementData`还是`0`；
>    2. 进入**`ensureExplicitCapacity()`**方法，满足判断条件发现，**所需最小容量>当前容量**，需要扩容，触发`grow()`方法。
>       1. 检查并记录`elementData`的长度，发现此时该值为`0`，**由于0的1.5倍还是0，此时扩容算法无意义不执行。**
>       2. 进入第一个`if`判断，发现条件满足，直接将`minCapacity`的值赋给一个新的变量`newCapacity=10`
>       3. 执行数组的`copyOf()`方法，将会开辟一个容量为`10`的数组。
>       4. 程序跳回`add()`方法，执行元素的添加。
>       5. `add()`方法执行结束。

**也就是说，如果我们调用无参构造器初始化集合，首次扩容并不会按照`1.5`倍的机制来，而是直接给你开一个大小为`10`的数组，只有当这`10`个空间全部用完之后，之后的每一次扩容，就都会采用`1.5`倍的机制进行扩容，因此首次调用的方法栈是比较绕的，但是从第二次开始，或者使用有参构造器初始化的时候就会少一些判断，空间不够，直接开始`1.5`倍扩容机制走起。**

##### 1.5倍扩容怎么算？

> 假设当前容量值为`8`，下一次扩容的值就是`12`，算法过程很简单：
>
> 12 = 8+8/2
>
>    = 8+4
>
>    =12
>
> 只不过，在源代码中，算法使用右移`>>`代替除法，要知道，**位运算的速度是远快于四则运算的**。由此，如果需要再次扩容的话，`12`的容量会扩容为`12+6 = 18`。

****

#### `Vector`

##### 基本结构

`Vector`类的定义，它实现自`List`接口。

```java
public class Vector<E>
    extends AbstractList<E>
    implements List<E>, RandomAccess, Cloneable, java.io.Serializable
```

它的底层实现也是基于对象数组，它由`protected`修饰符修饰：

```java
protected Object[] elementData;
```

`Vector`是线程安全的，它的操作方法都有`synchronized`修饰，该关键字可以实现线程同步和互斥，所以他是线程安全的。比如其源码中的`indexOf()`方法，因此，一般在开发中，如果有线程安全的需要，可以考虑使用`Vector`。当然，这也并非是必须的，关于线程安全的集合或者说实现，还有专门的类去管理，`Vector`在`JDK1.0`版本中就有的，算是一个老前辈了，尽管它线程安全，但也不一定就是最佳的选择。

```java
public synchronized int indexOf(Object o, int index) {
    if (o == null) {
        for (int i = index ; i < elementCount ; i++)
            if (elementData[i]==null)
                return i;
    } else {
        for (int i = index ; i < elementCount ; i++)
            if (o.equals(elementData[i]))
                return i;
    }
    return -1;
}
```

##### 源码分析

######  **扩容机制**

**默认10满后，按照2倍扩容。如果指定大小，则每次按2倍扩容。**

**创建一个无参的vector之后，它会默认直接给你一个大小为10的空间。直截了当。**

```java
public Vector() {
    this(10);
}
```

接着执行添加操作，跳转到`add()`方法(这里就不再提自动装箱的操作了)，源码如下,咋一看是不是和前面分析的`ArrayList`的源码如出一辙？除了一个`modCount++`之外，还是会在添加元素之前先执行一个名为`ensureCapacityHelper`的方法，基于前面`ArrayList`源码的阅读理解，这里不用多想也能猜到，这个方法的作用，无非就是对目前的数组容量进行判断，看看是不是需要扩容。

```java
public synchronized boolean add(E e) {
    modCount++;
    ensureCapacityHelper(elementCount + 1);
    elementData[elementCount++] = e;
    return true;
}
```

进入`ensureCapacityHelper`的源码看看,可以看到这实现和`ArrayList`中的实现几乎一样，还是判断最小所需空间和当前数组的容量关系，显然，这里`elementData=10,`而`minCapacity=1`，**不满足扩容的条件**，因此这里不会进入`grow()`方法。直接返回`add()`执行元素的添加，一次添加执行结束。

```java
private void ensureCapacityHelper(int minCapacity) {
    // overflow-conscious code
    if (minCapacity - elementData.length > 0)
        grow(minCapacity);
}
```

下面我们假设，要添加第`11`个元素，此时原来的10个空间已经不够，自然会触发扩容机制，下面是该扩容方法的实现源码：

```java
// 扩容方法
private void grow(int minCapacity) {
    // overflow-conscious code
    int oldCapacity = elementData.length;
    int newCapacity = oldCapacity + ((capacityIncrement > 0) ? capacityIncrement : oldCapacity);
    if (newCapacity - minCapacity < 0)
        newCapacity = minCapacity;
    if (newCapacity - MAX_ARRAY_SIZE > 0)
        newCapacity = hugeCapacity(minCapacity);
    elementData = Arrays.copyOf(elementData, newCapacity);
}
// 关于capacityIncrement的定义：
   /**
     * The amount by which the capacity of the vector is automatically
     * incremented when its size becomes greater than its capacity.  If
     * the capacity increment is less than or equal to zero, the capacity
     * of the vector is doubled each time it needs to grow.
     *
     * @serial
     */
    protected int capacityIncrement;
```

根据源码了解到，它会先将`elementData`的长度放到一个名为`oldCapacity`的变量中并创建一个新的容量`newCapacity`,该变量的值就是扩容的核心原理，其中` int newCapacity = oldCapacity + ((capacityIncrement > 0) ? capacityIncrement : oldCapacity)`这段三元表达式会先判断`capacityIncrement`的值是否`>0`,如果成立，那么`capacityIncrement`的值保持不变，那么整个表达式就是`newCapacity = oldCapacity+capacityIncrement`。

否则将会是`newCapacity =oldCapacity+oldCapactity`,也就`newCapacity `会**变为原来两倍的容量，**最后依旧是采用`copyOf()`方法将扩容后的空间复制到原空间，完成扩容。关于其中两个`if`判断的逻辑和之前对`ArrayList`的分析是类似的，不再赘述。通过这个源码也发现了，这个`2`倍扩容的算法中，有一个名为`capacityIncrement`的**容量增量**，具体作用面会在下面有参构造器中进行分析。

**有参构造器源码分析**

该构造器的源码如下，构造器是有两个参数的，其中一个便是上面提到的容量增量参数`capacityIncrement`。

```java
public Vector(int initialCapacity, int capacityIncrement) {
    super();
    if (initialCapacity < 0)
        throw new IllegalArgumentException("Illegal Capacity: "+
                                           initialCapacity);
    this.elementData = new Object[initialCapacity];
    this.capacityIncrement = capacityIncrement;
}
```

方法体首先会先调用父类的无参构造。如果我们不指定`capacityIncrement`的值，它默认是`0`，也就是**无增量**，一般在调用无参构造器时就是属于这种情况，**在没有明确容量增量时，扩容会按照原容量的2两倍进行，**如果指定具体的值，我们在``grow()``方法中看到，`  int newCapacity = oldCapacity + ((capacityIncrement > 0) ? capacityIncrement : oldCapacity);`这个表达式将产生一个新的容量值，**该值的大小由原来的容量+指定的容量增量决定**。那么可能会开始疑惑， 既然说了是`2`倍扩容，那么加一个容量增量算怎么回事？

如果指定了该增量的值，不就改变了2倍扩容的机制了吗？其实不完全是，在`vector`源码中，其实存在三个构造器，上面这个便是可以指定扩容增量的构造器，如果你不需要指定第二个参数，那么还可以看到，它还有一个普通的带一个参数的构造，源码如下：

```java
public Vector(int initialCapacity) {
    this(initialCapacity, 0);
}
```

该构造器尽管只需要一个参数，但它在创建之后会默认给`capacityIncrement`赋值为0，这也就是不管你是空参构造还是带参构造对`Vector`进行初始化，在扩容时都会用到`capacityIncrement`这样一个参数，这也是扩容算法中三元表达式的意义，**你可以不写，但我必须得用**，所以才会有默认的`0`,这是不冲突的。

```java
/*无参构造*/
Vector vector = new Vector();
/*指定一个参数：默认为集合的初始大小*/
Vector vector2 = new Vector(6);
/*指定两个参数：依次时集合大小和扩容时的容量增量*/
Vector vector3= new Vector(6,3);
```

****

#### `LinkedList`

##### 基本结构

- `LinkedList`底层实现采用了**双向链表**和**双端队列**。
- 可以添加任意元素且元素可以重复(因为实现自List接口)，同时包括`null`。
- 非线程安全的集合，没有实现同步。
- 在其中维护的两个属性`first`和`last`分别指向首尾节点，`prev`指向前驱节点，`next`指向后继节点。
- 因此`LinkedList`的元素**删除和添加的操作效率相对较高**。

##### 源码分析

[待更新……]

#### 如何选择

> 如何选择使用`ArrayList`和`LinkedList`?根据我们实际的使用场景或者需求

- 如果涉及改查操作比较多，建议`ArrayList`。
- 如果增删操作比较多，建议`LinkedList`。
- 一般来说，在程序中`80%~90%`都是查询操作，因此大部分情况下会选择使用`ArrayList`。
- 当然，选择哪一个并非一成不变，在实际的项目中，甚至可能出现`ArrayList`和`LinkedList`同时使用的情况，也是正常的，所以要求最好都会使用。

****

#### `Set`接口

下面主要讲解`Set`子接口下的主要实现类。

**常用方法和实现**

![](https://images.waer.ltd/img/Set.png)

**Set的基本介绍**

- 无序(元素的添加与取出的顺序不一致)，无索引。

  > 注意理解这里的无序的含义，并不是说，每一次取出的顺序都是随机的，而是指当执行了一次取出之后，今后的每一次相同的操作，它取出的元素顺序都与第一次相同，但**这个顺序又和添加进去的顺序不保持一致**。

- 不允许重复元素。

- 还有一点，由于它是`Collection`的子接口，自然也支持其父接口中的特性，比如迭代对象，增强for等等。

#### `HashSet`

##### 基本结构

> `HashSet`作为`Set`典型的实现类之一，拥有`Set`的全部属性，这里不再赘述。

##### 源码解读

###### 初始化与基本原理

我们先看一下`HashSet`的基本用法，其实，`HashSet`在实现上，就是一个`HashMap`,这一点可以从它的构造器说起。

```java
 Set hashSet = new HashSet();
```

以下是`HashSet`的无参构造器源码，可以看到，当我们创建一个`HashSet`对象时，它在底层直接`new`了一个`HashMap`，这又不得不说一下`HashMap`的底层，它是由**数组+链表+红黑树**构成，所以相对来说是比较复杂的。

![](https://images.waer.ltd/img/20220323200228.png)

```java
public HashSet() {
    map = new HashMap<>();
}
```

换句话说，要分析`HashSet`的源码，其实就是分析`HashMap`的原理。`HashSet`一个明显的特点就是不能添加重复的元素，但这里的**重复**也许不是你想象中的那么简单。

下面开始分析一下其中的添加元素的`add()`方法在底层是如何实现的。

> - **添加一个元素时，会先得到一个`hash`值，根据该值转成一个索引值。**
> - **找到存储数据表`table`，检查该索引是否已在`table`中存在有元素**：
>   - **如果没有，直接将该元素加入。**
>   - **如果有，会调用`equals`方法进行比较操作，如果比较结果为`true`,添加失败，否则，将会在末尾添加元素。**
>   - **在`Java8`中，如果一条链表的元素个数达到`TREEIFY_THRESHOLD`且`table`的大小`>=`MIN_TREEIFY_CAPACITY,就会触发树化机制，即会由单链表结构转换为一棵红黑树。**

为例更好的理解它的执行过程和原理，我们按照下面这几行代码来讲解:

```java
HashSet hashSet = new HashSet();
hashSet.add("Java");
hashSet.add("C++");
hashSet.add("Java");
System.out.println("hashSet="+hashSet);
```

代码逻辑很简单，就是向`HashSet`中添加三个元素，其中有**两个元素是重复**的，这是为了理解它底层是如何判断元素重复的。

执行代码，首先会进入`HashSet`的构造器，直接创建一个值为空的`HashMap`，这点在上面已经说过。进入`add()`方法，它的实现源码如下：

```java
//HashSet中add方法的源码实现
public boolean add(E e) {
    return map.put(e, PRESENT)==null;
}
```

方法很简单，直接调用了`map`的`put()`方法,注意到，这个方法除了我们需要添加的元素`e`之外，它还有一个名为`PRESENT`的常量参数，关于这个参数的理解，源码中是这样介绍的：

```java
// Dummy value to associate with an Object in the backing Map
private static final Object PRESENT = new Object();
```

`PRESENT`其实是一个`static final`修饰的对象，在上面的方法中作为`put(k,v)`中`value`的占位，并没有其他实际的作用。这里不必深究。不知道有没有注意到，`add`方法中将`map.put(e,PRESENT)==null`作为返回值，为什么这里会是`null`呢？这和`HashMap`底层实现有关系，我们先继续往下，后面自然就会明白了。下面进入`put`方法内部看看。

```java
//HashSet中map.put(e,PERSENT)方法源码
public V put(K key, V value) {
    return putVal(hash(key), key, value, false, true);
}
```

方法中有一个`putVal`的方法，可以看到其中的第一个参数`hash(key)`表示通过这个方法获取`key`的`hash`值。这里的`key`也就是我们传入的待添加的元素，进入该方法：果然，`hash`方法的作用就是计算`key`的`hash值`，算法都在这条三元表达式当中了，可以简单看一下。

```java
//HashMap中的hash()方法实现
static final int hash(Object key) {
    int h;
    return (key == null) ? 0 : (h = key.hashCode()) ^ (h >>> 16);
}
```

核心算法`(key == null) ? 0 : (h = key.hashCode()) ^ (h >>> 16)`，意思就是如果传入的`key`为`null`,那么直接返回0，也就是不执行任何实际操作。**否则会使用`hashCode()`方法获取`key`的哈希码和无符号右移16位之后的值进行一个异或操作**，将该异或的结果返回作为`key`最终的`hash`值。这样作主要是为了保证**高16位和低16未的特征，减少碰撞，减低`hash`冲突的几率**。

注意，`hash`和`hashCode`并不是一回事。

> 这里的`hash`仅仅是用来在`HashMap`中计算`key`对应的散列码。它的算法中用到了`hashCode()`这个方法，`hashCode`是在`Objct`中定义的，用来获取每个元素对应的散列值，**底层使用的C语言作为实现**,属于`native`方法。换句话说，使用`hashCode()`方法可以计算`Java`中每一个元素的一个哈希值。而`hash()`方法在这里的作就相对局限，使用的算法也相对简单很多，具体的关于`hash和hashCode()`的内容，可以自己研究，这里不作展开。

理解了`hash`的计算方式之后，继续往后看，在获取到`key`的`hash`，方法会返回进入到`putVal()`方法中，这是整个添加操作的底层实现的核心源码，也是一个难点。

```java
final V putVal(int hash, K key, V value, boolean onlyIfAbsent,
               boolean evict) {
    Node<K,V>[] tab; Node<K,V> p; int n, i;
    if ((tab = table) == null || (n = tab.length) == 0)
        n = (tab = resize()).length;
    if ((p = tab[i = (n - 1) & hash]) == null)
        tab[i] = newNode(hash, key, value, null);
    else {
        Node<K,V> e; K k;
        if (p.hash == hash &&((k = p.key) == key || (key != null && key.equals(k))))
            e = p;
        else if (p instanceof TreeNode)
            e = ((TreeNode<K,V>)p).putTreeVal(this, tab, hash, key, value);
        else {
            for (int binCount = 0; ; ++binCount) {
                if ((e = p.next) == null) {
                    p.next = newNode(hash, key, value, null);
                    if (binCount >= TREEIFY_THRESHOLD - 1) // -1 for 1st
                        treeifyBin(tab, hash);
                    break;
                }
                if (e.hash == hash &&((k = e.key) == key || (key != null && key.equals(k))))
                    break;
                p = e;
            }
        }
        if (e != null) { // existing mapping for key
            V oldValue = e.value;
            if (!onlyIfAbsent || oldValue == null)
                e.value = value;
            afterNodeAccess(e);
            return oldValue;
        }
    }
    ++modCount;
    if (++size > threshold)
        resize();
    afterNodeInsertion(evict);
    return null;
}
```

在方法体的开始，定义了几个局部变量，以备后面使用(废话)。继续看下面的代码，这是方法体的第一个if判断，主要的作用是判断并创建一个`table`，注意，这里的`table`是一个数组+链表形式的结构，也就是数组每一个索引出的元素都是一条单链表的形式。这一点前面有提到。具体的逻辑是，

```java
if ((tab = table) == null || (n = tab.length) == 0){
     n = (tab = resize()).length;
}
```

首先，对于`if`中的`(tab = table) == null `条件，程序先将`table`赋值给`tab`变量，判断集合中是否已经存在`table`数据，或者说该数组的长度是否为`0`。如果上述条件有一个成立，则表示**这是第一次向集合中添加元素**，`hashMap`会自动调用`resize()`方法对`table[]`进行首次扩容，以用来存放接下来的元素，所以，明白了这个判断的作用，也就不难推测，为什么这条`if`判断语句会放在方法的开始了，也可以推测，只要不是首次添加元素，就不再会进入该判断，直接走后面的逻辑。那么现在的关注点就该转移到这个`resize()`方法中，看一下它的源码：

```java
final Node<K,V>[] resize() {
    Node<K,V>[] oldTab = table;
    int oldCap = (oldTab == null) ? 0 : oldTab.length;
    int oldThr = threshold;
    int newCap, newThr = 0;
    if (oldCap > 0) {
        if (oldCap >= MAXIMUM_CAPACITY) {
            threshold = Integer.MAX_VALUE;
            return oldTab;
        }
        else if ((newCap = oldCap << 1) < MAXIMUM_CAPACITY &&
                 oldCap >= DEFAULT_INITIAL_CAPACITY)
            newThr = oldThr << 1; // double threshold
    }
    else if (oldThr > 0) // initial capacity was placed in threshold
        newCap = oldThr;
    else {               // zero initial threshold signifies using defaults
        newCap = DEFAULT_INITIAL_CAPACITY;
        newThr = (int)(DEFAULT_LOAD_FACTOR * DEFAULT_INITIAL_CAPACITY);
    }
    if (newThr == 0) {
        float ft = (float)newCap * loadFactor;
        newThr = (newCap < MAXIMUM_CAPACITY && ft < (float)MAXIMUM_CAPACITY ?
                  (int)ft : Integer.MAX_VALUE);
    }
    threshold = newThr;
    @SuppressWarnings({"rawtypes","unchecked"})
    Node<K,V>[] newTab = (Node<K,V>[])new Node[newCap];
    table = newTab;
    if (oldTab != null) {
        for (int j = 0; j < oldCap; ++j) {
            Node<K,V> e;
            if ((e = oldTab[j]) != null) {
                oldTab[j] = null;
                if (e.next == null)
                    newTab[e.hash & (newCap - 1)] = e;
                else if (e instanceof TreeNode)
                    ((TreeNode<K,V>)e).split(this, newTab, j, oldCap);
                else { // preserve order
                    Node<K,V> loHead = null, loTail = null;
                    Node<K,V> hiHead = null, hiTail = null;
                    Node<K,V> next;
                    do {
                        next = e.next;
                        if ((e.hash & oldCap) == 0) {
                            if (loTail == null)
                                loHead = e;
                            else
                                loTail.next = e;
                            loTail = e;
                        }
                        else {
                            if (hiTail == null)
                                hiHead = e;
                            else
                                hiTail.next = e;
                            hiTail = e;
                        }
                    } while ((e = next) != null);
                    if (loTail != null) {
                        loTail.next = null;
                        newTab[j] = loHead;
                    }
                    if (hiTail != null) {
                        hiTail.next = null;
                        newTab[j + oldCap] = hiHead;
                    }
                }
            }
        }
    }
    return newTab;
}
```

那就看下它的扩容原理吧。首先呢，如前面说所，它开始就创建了一个`table[]`。将该数组的引用赋给`oldTab`,

```java
 Node<K,V>[] oldTab = table;
```

注意这里这个数组首次定义并非在这个方法中，而是在`HashMap`源码中有做的一个定义，**它也是不可被序列化的**。接着会先判断该`table`是否是首次创建，如果是，直接初始化为0，否则就是`oldTab`的大小，为什么会这么说呢，因为这个`resize()`方法可不只是执行这一次，在`putVal()`方法的后续的逻辑中还会用到，也就是会出现再次扩容的情况，那么存在一个`oldTab`的值也就不难理解了吧。

如果`oldCap>0`，进一步判断它是否`>=`最大容量`MAXNUM_CAPACITY`,关于`MAXNUM_CAPACITY`的定义如下

```java
//MAXIMUM_CAPACITY定义
static final int MAXIMUM_CAPACITY = 1 << 30;
```

如果该条件成立，会给`threshod`重新赋一个新的容量值，即`Integer`的上限，反之进入下一个判断` ((newCap = oldCap << 1) < MAXIMUM_CAPACITY &&oldCap >= DEFAULT_INITIAL_CAPACITY)`,将`oldCap`左移1位,也就是两倍的`oldCap`赋给一个新的变量`newCap`,如果该值小于`MAXNUM_CAPACITY`并且原来的容量`oldCap`大于等于初始默认容量值`DEFAULT_INITIAL_CAPACITY`的话，就将新的`newThr`扩为原来(`oldThr`)的两倍大小。

```java
//DEFAULT_INITIAL_CAPACITY定义
static final int DEFAULT_INITIAL_CAPACITY = 1 << 4; // aka 16
//1<<4等价于1X2^4=2x2x2x2=16
```

> **这里先对上面源码中涉及到的几个变量简单说明一下**，**不然频繁的`=`赋值操作一波又一波，可能会给整懵圈。**
>
> 1. `oldCap`:数组原先(准备扩容之前)的容量。
> 2. `oldThr`：其实就是`threshold`的一个暂存局部变量，用来暂存`threshold`的值。
> 3. `threshold`：这是一个定义在`HashMap`的的全局变量(**可以这么说，实际上`Java`中没有全局变量这种概念**),它用来存放`table[]`的一个容量值，或者说**阈值**。所以最终决定是否需要扩容取决于这个全局变量来判断。
> 4. `newCap`:同理于`oldCap`。

继续回到最外层`if`判断的`else if`逻辑中，这里先是对`newThr`是否大于0作了判断，如果`>0`成立，那么新的容量`newCap`的值沿用`oldThr`,否则将会执行下面这段代码,`newCap`的值默认设置为`DEFAULT_INITIAL_CAPACITY`也就是`16`,并且`newThr`的值更新为`(int)(DEFAULT_LOAD_FACTOR * DEFAULT_INITIAL_CAPACITY);`。这里参与`*`运算的除了初始默认容量`DEFAULT_INITIAL_CAPACITY`外，还有一个重要的常量参数`DEFAULT_LOAD_FACTOR`，我们称为**负载因子**，换句话说，这个因子的值决定了你每次扩容的具体大小。它是默认值为`0.75`,也就是说当我们数组占用量达到本身容量的75%时，就会触发首次扩容(`resize`)操作。当然，最后还进行了强制类型转换为`int`。

所以不难理解，如果我们是首次使用`HashMap`进行`put`操作，方法会直接进入这一步进行初始化。

```java
else {// zero initial threshold signifies using defaults
    newCap = DEFAULT_INITIAL_CAPACITY;
    newThr = (int)(DEFAULT_LOAD_FACTOR * DEFAULT_INITIAL_CAPACITY);
}
```

> 具体一点说，当阈值达到`16*0.75`时，也即是16大小的容量用掉了12个大小时就会触发首次`resize`。

这个**负载因子**不是固定不变的，而且有一点需要说明的是，这个`resize()`方法中，**负载因子是可以手动传入的**，这一点在`HashMap`的另一个构造方法中有体现，当然，这个后面再说。这里主要讲的还是无参构造器的执行原理，你需要理解`resize()`方法的两个主要作用，第一个就是上面巴拉巴拉这一堆，**主要是用来对数组进行初始化工作**(当然，你也可以理解为首次扩容，这只是一种说法而已，一般我们会将首次扩容称为初始化，因为其实**扩容的概念是建立在已有容量的基础上的**)，而此后再调用`resize()`就执行的是扩容工作了，但它的扩容工作可没有初始化这么简单。

但为了能更清晰的理解，我们还是继续首次`put`操作的主线进行分析。接着上面说，初始化结束之后，会得到一个初始的阈值`newThr=16`,并将该阈值重新赋给全局`threshold`保存。计算出`table[]`的一个初始大小之后，利用该值直接创建一个大小为`newCap`的新的`newTab`给`table`返回，有了这个`table`，我们就可以在里面存放元素了，比如存放一个字符串`Java`。

```java
threshold = newThr;
@SuppressWarnings({"rawtypes","unchecked"})
Node<K,V>[] newTab = (Node<K,V>[])new Node[newCap];
table = newTab;
```

但光是初始化一个16大小的`table`是远远不够的。我们知道，既然是数组里面存放元素，是需要一个索引的，根据这个索引去找到一个对应的位置，再将该元素覆盖上去，完成元素的添加。

所以我们先回到上一个方法`putVal()`方法：接着上面切入进来的`resize()`方法之后讲解。

```java
if ((tab = table) == null || (n = tab.length) == 0)
    n = (tab = resize()).length;
```

> 上面这两行代码，也就是我们上面刚刚讲完的初始化操作的部分。

看一下，在对`table`进行了初始化，并计算得到`key`的`hash`之后，后续的代码逻辑分解：

```java
if ((p = tab[i = (n - 1) & hash]) == null)
    tab[i] = newNode(hash, key, value, null);
```

这里就是根据`hash`值计算一个索引`i`。方法是`(n-1) & hash`,在获得索引之后，检查该索引位置的值`tab[i]`赋给变量`p`并判断是否为`null`，如果为`null`表示没有被使用，后面一句`tab[i] = newNode(hash, key, value, null);`直接将元素`key`存进去,当然，存入的元素除了我们自己传入的数据之外，还有计算出来的`hash`和一个`value`，传入`hash`主要是为了**下一次计算，用来确定下次传入的值是否为重复元素。**至于其中还有一个值为`null`的值，表示**链表的下一个结点指向**，当然，这里是首次`put`，所以`next`是不存在的，也就是`null`。当上面这段代码执行完毕之后，元素就被成功添加到`table`中了。

![image-20220325162444469](C:/Users/22170/AppData/Roaming/Typora/typora-user-images/image-20220325162444469.png)

> 通过`debug`可以看到,`key`计算出的`hash=2301537`.那么这个索引就可以根据`(16-1)&2301537`计算出来，它的值是为`1`的，也就是数组中第二个位置的索引。

![image-20220325162819682](C:/Users/22170/AppData/Roaming/Typora/typora-user-images/image-20220325162819682.png)

 元素添加之后，程序逻辑会直接执行到下面的代码

```java
++modCount;
if (++size > threshold)
    resize();
afterNodeInsertion(evict);
return null;
```

其中的`++modCount`我在`ArrayList`源码分析的文章中已经提过，他们的作用是一样的。判断`if (++size > threshold)`，如果添加元素之后的数组容量`>`目前的阈值`threshold`，会触发`resize()`。关于`afterNodeInsertion(evict);`方法，是`HashMap`留给它的子类去实现的一个方法，所以它是个空的方法。类似的方法还有：

```java
// Callbacks to allow LinkedHashMap post-actions
void afterNodeAccess(Node<K,V> p) { }
void afterNodeInsertion(boolean evict) { }
void afterNodeRemoval(Node<K,V> p) { }
```

接着`putVal()`方法最后返回一个`null`作为方法的结束。**所以还记得前面留的一个问题吗**？在`HashSet`源码中的`add()`方法的方法体里面，它的返回值是判断是否为`null`,再看一下吧还是。

```java
public boolean add(E e) {
    return map.put(e, PRESENT)==null;
}
```

表示执行`HashSet`中的`add()`方法添加一个元素，它底层实际上调用了`HashMap`中的`put()`方法去实现，能否添加成功的依据就是该`put()`方法是否返回`null`,如果是，`HashSet`的`add()`方法就返回一个`true`,最终表示着我们利用`HashSet`成功的添加了一个元素。否则，添加失败！！

****

###### 去重原理

> 在理解了`HashMap`底层`table[]`的初始化逻辑之后，当我们向其中`put()`第二个元素时，它的底层是如何判断元素是否重复的呢？下面就以这个问题为主线开始分析。

由于同样是添加的操作，前面的的几个步骤就不再赘述，比如底层调用`map.put()`，然后是`hash`的计算。直接进入`putVal()`方法开始看。这里再贴一遍它的源码：

```java
final V putVal(int hash, K key, V value, boolean onlyIfAbsent,boolean evict) {
    Node<K,V>[] tab; Node<K,V> p; int n, i;
    if ((tab = table) == null || (n = tab.length) == 0)
        n = (tab = resize()).length;
    if ((p = tab[i = (n - 1) & hash]) == null)
        tab[i] = newNode(hash, key, value, null);
    else {
        Node<K,V> e; K k;
        if (p.hash == hash &&
            ((k = p.key) == key || (key != null && key.equals(k))))
            e = p;
        else if (p instanceof TreeNode)
            e = ((TreeNode<K,V>)p).putTreeVal(this, tab, hash, key, value);
        else {
            for (int binCount = 0; ; ++binCount) {
                if ((e = p.next) == null) {
                    p.next = newNode(hash, key, value, null);
                    if (binCount >= TREEIFY_THRESHOLD - 1) // -1 for 1st
                        treeifyBin(tab, hash);
                    break;
                }
                if (e.hash == hash &&
                    ((k = e.key) == key || (key != null && key.equals(k))))
                    break;
                p = e;
            }
        }
        if (e != null) { // existing mapping for key
            V oldValue = e.value;
            if (!onlyIfAbsent || oldValue == null)
                e.value = value;
            afterNodeAccess(e);
            return oldValue;
        }
    }
    ++modCount;
    if (++size > threshold)
        resize();
    afterNodeInsertion(evict);
    return null;
}
```

鉴于前面我们在添加第一个元素`Java`的时候，已经完成了`table[]`的初始化工作，所以下面这段代码不会再执行;

```java
if ((tab = table) == null || (n = tab.length) == 0) n = (tab = resize()).length;
```

而是直接带着前面计算得来得`Hash`通过与之前同样算法计算出元素`C++`(假设这是我们第二个添加的元素)在数组中的索引，代码如下：

```java
if ((p = tab[i = (n - 1) & hash]) == null) tab[i] = newNode(hash, key, value, null);
```

>注意哈，这里的`n`在初始化的时候已经计算出来，还是等于16的，改变的是`hash`值，假设为`65762`。那么根据上述算法计算得到它的索引为`15&65762=2`。

好了，既然索引也有了，并且我们添加的这个元素和第一个元素`Java`明显是不相等的，所以不会进入到`else if`判断中，因为`if`已经成立，后面的逻辑就是将该元素值直接添加到数组中索引为`2`的位置，当然，元素也是一个`Node<k,v>`类型。注意，这里存入参数中的最后一个值依旧还是`null`，因为前后两个元素并没有存放在同一条链表上，自然不会出现在尾部挂载的情况。

> 下面将会进行第三个元素的添加，假设我们添加的元素是`Java`,是的，和**首次添加的元素是相同的**，看一下底层将会如何处理。

同样我们直接跳到`putVal()`方法中。程序首先会进入到第二个`if`判断里，开始计算索引并作判断，也就是下面这段代码：

```java
if ((p = tab[i = (n - 1) & hash]) == null)
    tab[i] = newNode(hash, key, value, null);
```

注意了，由于首次计算得出`Java`对应的索引为`2`,那么这次的结果也是相同的值，所以`if`中的条件显然不可能成立，因为索引为`2`的位置已经被占用，自然不会为`null`。所以程序将会进入下面的逻辑中：

```java
else {
    Node<K,V> e; K k;
    if (p.hash == hash &&
        ((k = p.key) == key || (key != null && key.equals(k))))
        e = p;
    else if (p instanceof TreeNode)
        e = ((TreeNode<K,V>)p).putTreeVal(this, tab, hash, key, value);
    else {
        for (int binCount = 0; ; ++binCount) {
            if ((e = p.next) == null) {
                p.next = newNode(hash, key, value, null);
                if (binCount >= TREEIFY_THRESHOLD - 1) // -1 for 1st
                    treeifyBin(tab, hash);
                break;
            }
            if (e.hash == hash &&
                ((k = e.key) == key || (key != null && key.equals(k))))
                break;
            p = e;
        }
    }
    if (e != null) { // existing mapping for key
        V oldValue = e.value;
        if (!onlyIfAbsent || oldValue == null)
            e.value = value;
        afterNodeAccess(e);
        return oldValue;
    }
}
```

又是一堆`if else if`套娃操作。按照它的顺序，我们先分析第一个`if`的逻辑：

```java
if (p.hash == hash &&((k = p.key) == key || (key != null && key.equals(k))))
    e = p;
```

鉴于`()`中涉及到了三处逻辑运算，方便理解，我们将它逐层进行拆分讲解。

```java
(k = p.key) == key || (key != null && key.equals(k))
```

首先看`||`的左边`(k=p.key)==key`:意思是先将`p`中的`key`值赋给变量`k`,再与`key`进行一个比较，判断是否为同一个`key`值(对象)，注意了，这里的两个`key`的意思，前一个`key`(也就是`k`)**代表的是数组之前已经存在数组中的元素，**而后一个`key`**就是当前传入的元素**，具体的也就是指我们第一次存入的`Java`和本次存入的`Java`。

再看`||`右边`(key != null && key.equals(k)`,这是一个`&&`操作,需要操作符两边的条件同时成立，整个条件才会成立。首先判断存入的`key`是否为`null`，再判断`key`和`k`是否为相同（注意这里用了`equals()`方法,该方法可被重写），判断是否为相同的内容。回到外层的`p.hash==hash`这个判断，就是将已有索引处对应的元素(元素是存在`Node`上的)的`hash`值取出与当前元素的`Hash`进行比较。

所以归纳起来也就是当二者`hash`相同并且`key`也相同(同一个对象)的情况下，执行`e=p`赋值操作，将原位置的值进行覆盖。

如果上面的条件不成立，会判断`p`是否是红黑树，如果是，就调用对应的添加方法`putTreeVal()`进行添加，也就是下面的代码。这里的 `instanceof`关键字用来判断一个对象是否为一个类的实例。另外，`putTreeVal()`方法内部涉及到大量红黑树的代码，相对复杂很多，如果跳进去的话，估计一时半会出不来，所以这里暂时不作探究，会另外分开来学习，还是围绕着主线继续分析。

```java
else if (p instanceof TreeNode)
    e = ((TreeNode<K,V>)p).putTreeVal(this, tab, hash, key, value);
```

否则，进入`else`逻辑中：

```java
else {
    for (int binCount = 0; ; ++binCount) {
        if ((e = p.next) == null) {
            p.next = newNode(hash, key, value, null);
            if (binCount >= TREEIFY_THRESHOLD - 1) // -1 for 1st
                treeifyBin(tab, hash);
            break;
        }
        if (e.hash == hash &&
            ((k = e.key) == key || (key != null && key.equals(k))))
            break;
        p = e;
    }
}
```

开局一个`for`，目的明确，**既然上面两种情况都不成立，那么说明该元素可能会在某一条链表节点上出现**，比如下面这样：

```java
Java->C++->Javascript->Java
```

所以我们需要以遍历的方式去检查链表上的每一个节点，循环内部，通过`p`和`e`两个指针不停的循环比较。

如果过程中发现有一个和当前元素重复的元素，循环会立即结束，元素添加失败，否则就将当前元素直接挂到节点后面，完成添加。注意其中这段代码:

```java
if (binCount >= TREEIFY_THRESHOLD - 1) // -1 for 1st
    treeifyBin(tab, hash);
//TREEIFY_THRESHOLD的定义
static final int TREEIFY_THRESHOLD = 8;
```

这是在进行**添加之后对当前这条链表进行一个判断**，如果长度`>=(TREEIFY_THRESHOLD=8)-1`的话，会调用`treeifBin()`方法对当前链表进行树化(转红黑树)，但是注意，光是这个条件满足还不足以开始树化，在这个方法的实现中，还添加了其他的添加用来判断，`treeifBin()`源码：

```java
final void treeifyBin(Node<K,V>[] tab, int hash) {
    int n, index; Node<K,V> e;
    if (tab == null || (n = tab.length) < MIN_TREEIFY_CAPACITY)
        resize();
    else if ((e = tab[index = (n - 1) & hash]) != null) {
        TreeNode<K,V> hd = null, tl = null;
        do {
            TreeNode<K,V> p = replacementTreeNode(e, null);
            if (tl == null)
                hd = p;
            else {
                p.prev = tl;
                tl.next = p;
            }
            tl = p;
        } while ((e = e.next) != null);
        if ((tab[index] = hd) != null)
            hd.treeify(tab);
    }
}
```

就是说，就算前面的条件(`>=8`)已经成立，这里还会进行一个判断，具体逻辑如下：

```java
if (tab == null || (n = tab.length) < MIN_TREEIFY_CAPACITY)
    resize();
```

它还会判断当前这个`table`的大小是否`<MIN_TREEIFY_CAPACITY`也就是是否`<64`。如果这个条件成立，那么会先对数组进行一个`resize()`扩容操作，而不是直接转红黑树。最后如果添加失败，会返回一个之前元素的`value`值。

```java
if (e != null) { // existing mapping for key
    V oldValue = e.value;
    if (!onlyIfAbsent || oldValue == null)
        e.value = value;
    afterNodeAccess(e);
    return oldValue;
	}
}
```

###### 扩容原理

前面对整个流程有了大致的了解之后，下面主要针对它的**扩容原理**进行一个简单的总结。

关于扩容的原理，先说结论：

- `HashSet`底层是`HashMap`，首次添加时，`table`数组的容量扩为16，初始临界值为12:

  > threshold(阈值) = table.size()(table数组大小) * loadFactor(加载因子)
  >
  > =16*0.75
  >
  > =12

- 如果`table`数组使用的部分达到了阈值，就会触发扩容，具体的扩容为`16*2=32`,也就是**会按照两倍的扩容**方式进行，基于这个容量再次计算新的扩容阈值:`32*0.75=24`,也就是如果本次扩容后的容量(32)使用达到24之后，就会再次触发下一次的2倍扩容机制，以此类推。

**简单来说，以上就是`HashSet(本质HashMap)`的扩容原理，具体的，看下面源码分析。**

> 在resize()方法中有这样一段代码

```java
else if ((newCap = oldCap << 1) < MAXIMUM_CAPACITY &&
         oldCap >= DEFAULT_INITIAL_CAPACITY)
    newThr = oldThr << 1; // double threshold
```

可以看到，新的容量是在原有容量的基础作了一个左移的操作，也就是和乘2是等效的，但用位运算效率会快很多。

> 这是在pustVal()源码的部分代码：

```java
++modCount;
if (++size > threshold)
    resize();
afterNodeInsertion(evict);
return null;
```

> resize();就是触发扩容时调用的扩容方法。具体的源码前面有讲过，不再赘述。

在Java8中，如果一条链表的元素个数达到` TREEIFY_THRESHOLD`且此时`table`的大小>=`MIN_TREEIFY_CAPACITY`

时就会触发链表转红黑树的操作。提高性能。

> 上面涉及到的两个常量在源代码中的定义如下：

```java
static final int TREEIFY_THRESHOLD = 8;
static final int MIN_TREEIFY_CAPACITY = 64;
```

转红黑树的方法源码如下，这里只需要看看大致的执行逻辑就好，关于红黑树具体的实现，不是本章的主要内容。

```java
final void treeifyBin(Node<K,V>[] tab, int hash) {
    int n, index; Node<K,V> e;
    if (tab == null || (n = tab.length) < MIN_TREEIFY_CAPACITY)
        resize();
    else if ((e = tab[index = (n - 1) & hash]) != null) {
        TreeNode<K,V> hd = null, tl = null;
        do {
            TreeNode<K,V> p = replacementTreeNode(e, null);
            if (tl == null)
                hd = p;
            else {
                p.prev = tl;
                tl.next = p;
            }
            tl = p;
        } while ((e = e.next) != null);
        if ((tab[index] = hd) != null)
            hd.treeify(tab);
    }
}
```

**注意如果只是满足链表长度达到8的条件时，它还是会采用`resize()`方法对数组扩容，而不是直接转红黑树。**

**注意了！！**

> 上面提到的触发数组扩容的条件中，`size`的大小大于负载因子才会触发，这里的`size`指`的是数组和链表中元素的和`，也就是只要我们向其中添加一个元素，不论这个元素是存在数组第一个位置，还是存在链表中某个位置，`size都会自增1`，这是一个比较容易搞错的地方，**不要认为size就是指数组的长度，这是错误的。**



****

**为什么不直接使用`hash`来计算索引，而是要进行取模运算？**

> 如果将哈希码映射到数组中的一个索引。可能会因为`hash`值过大而因此导致索引超出范围。所以一个最简单的方法是对哈希码和数组的长度进行模运算，如`hash(key) % n`。如此可以**确保索引i总是在0和n之间。**

但是Java在实现的时候，用的并不是上面说的算法，而是将**数组的长度n减去1之后再与`hash`作`&`运算得到**，实现代码如下:

```java
i = (n - 1) & hash;
```

****

#### LinkedHashSet

##### 概述

- `LinkedHashSet`是`Set`接口的一个实现子类，也是`HashSet`的子类。
- `LinkedHashSet`的底层是一个`LinkedHashMap`，底层维护了一个**数组+双向链表**。
- `LinkedHashSet`根据元素的`hashCode`值来决定元素的存储位置，同时**使用链表来维护元素的次序**，这就使得元素看起来是以插入的顺序保存的。
- 其次，`LinkedHashSet`也**不允许添加重复元素**。

![](https://images.waer.ltd/img/LinkedHashSet.png)

在`LinkedHashSet`中维护了一个`hash`表和双向链表，每一个节点有`pre`和`next`属性，这样可以形成双向链表。在添加元素时，先求`hash`值，再求索引，确定该元素在哈希表中的位置，然后将添加的元素加入到双向链表（如果已经存在，不添加(原理和`hashset类似`)）。

##### 源码解读

- 通过下面的示例来配合讲解：

```java
Set set = new LinkedHashSet();
set.add("A");
set.add(120);
set.add(120);
set.add(new User("李",1001));
set.add(123);
set.add(new String("hello"));
System.out.println(set);
```

如果断点的方式，我们可以看到，`LinkedHashSet`的一个基本结构如下：

![](https://images.waer.ltd/img/20220426085807.png)

通过上图可以发现，其中存在一个`tail`和`head`的属性，这是典型的双向链表中才会用到的两个引用，或者指针(c/c++)，**代表双向链表的头尾指针**。即进一步验证了前面提到的`LinkedHashSet`的是一个`HashTable`和双向链表的组合。

其中的`table`类型其实是一个`HashMap$Node[]`类型，而每一个节点又是维护的`LinkedHashMap$Entry[]`类型。

![](https://images.waer.ltd/img/20220426090925.png)

为什么数组为`HashMap$Node[]数组类型`而存放的元素却是`LinkedHashMap$Entry[]`类型？

> 说明`LinkedHashMap$Entry[]`肯定继**承或者实现**了`HashMap$Node[]`的，即通过**数组多态**的方式实现。注意这里的`$`符号标识$之后的类作为`$`之前的一个静态内部类，也即表示在`LinkedHashMap$Entry`中，`Entry`是`LinkedHashMap`的一个**静态内部类。**

在`LinkdeHashMap`中我们可以找到对应的源码验证。

```java
static class Entry<K,V> extends HashMap.Node<K,V> {
    Entry<K,V> before, after;
    Entry(int hash, K key, V value, Node<K,V> next) {
        super(hash, key, value, next);
    }
}
```

从上述的源码中不仅说明`Entry`是`LinkedHashMap`的内部类，也说明`LinkedHashMap$Entry[]`继承了`HashMap$Node[]`。

其中有两个`Entry<K,V>`类型的属性：`before`和`after`，可以理解为两个引用，主要用来完成各节点之间的连接。

同样，我们也可以通过查看`HashMap`的源码，验证上面的说法：`Node`同样作为其一个静态的内部类实现。并且该类还实现了其父接口`Map`中的`Entry<K,V>`。

```java
static class Node<K,V> implements Map.Entry<K,V> {
    final int hash;
    final K key;
    V value;
    Node<K,V> next;

    Node(int hash, K key, V value, Node<K,V> next) {
        this.hash = hash;
        this.key = key;
        this.value = value;
        this.next = next;
    }
```

![](https://images.waer.ltd/img/20220426092722.png)

在存储元素时，每一个元素中依然是使用的`key`来存储，而`value`只是一个`object`类型的占位符，这里没有实际的意义。因为在`LinkedHashSet`中，我们**不需要显式的去像Map中存一个`K,V`形式的值。**

- 当我们添加一个重复元素时，`LinkedHashSet`会直接调用父类`HashSet`中的比较方法，对重复元素进行一个判断并去重，其实这里的原理和之前讲的`HashSet`原理是一样的，当添加元素是，`LinkedHashSet`还是会直接调用父类`HashSet`中的`add()`方法(该方法本质还是调用`HashMap`中的`put()`方法)，接着是`putVal()`关于这两个方法的源码在前面讲`HashSet`源码的时候就已经讲过，这里不再赘述。所以说，经管是不同的结构实现，但在元素判重的原理上其实使用的还是同一个逻辑。

**说白了，LinkedHashSet本质上大部分还是HashMap**

- `LinkedHashset`底层维护了一个`LinkedHashMap`结构，这一点可以类比于`HashSet`底层维护一个`HashMap`来进行对比记忆。而前面我们已经知道，`LinkedHashMap`其实就是`HashMap`的一个子类。

- 对于`LinkedHashSet`我们在理解了前面`HashSet`源码的基础上，只需要理解它底层的一个实现结构即可，也就是数组+双向链表的结构，回到一开始的哪个示例中，我们向set集合中添加了：

> “A”，120, User,123

之后，通过断点的方式可以看到他们之间的一个指向关系如下

![](https://images.waer.ltd/img/20220426100922.png)

> 上图展示了内部元素节点中`after`和`before`的引用关系。仔细观察每一个`LinkedHashMap$Entry`后都会跟一个`@number`的标识，**这是用来标识该位置元素的一个唯一标记，或者你也可以理解为该元素在该结构中的一个地址。**因此，我们可以用该标识来唯一性的代表一元素值，注意其中每一各`after`或者`before`的指向关系，具体在后面我回画个图帮助理解。

- 再跳出元素内部`Entry`，我们看到在`table`中有两个名为`head`和`tail`的引用属性。用来标识该双向链表的头尾节点。

![](https://images.waer.ltd/img/20220426101903.png)

将上面的逻辑以图片的形式展示出来大概就是下面这样：

![](https://images.waer.ltd/img/LinkedHashSet.jpg)

简单捋一下：

> - 每向`LinkedHashSet`中添加一个元素，首先会根据该元素计算一个`hash`值，用来确定它在上面图中`table`数组中的索引位置。
> - 通过上面的步骤添加多个元素之后，元素内部是一个`Entry[]`类型的结构，其中每一个元素都有一个`after`和`before`属性，用**来指向它的前一个元素和后一个元素的位置。**
> - 再通过两个属性`head`和`tail`来指向整个链表的头和尾，从而构成一个**完整的含有头尾指针(引用)的双向链表。**
> - 将该链表具象化出来可以大致表示为图中右边部分。换句话说，这里的`after`和`before`其实就相当于平时常用的`pre`和`next`指针，即前驱后继指针，只不过命名不同而已，没什么高深莫测的。
> - 注意，和前面`HashSet`的数组+单链表的结构类似，每一个索引位都可以是一条完整的双向链表，就像图中索引为7的位置一样，而不是每个索引为只能有一个链表节点，这取决于元素计算出来的`hash`。
> - 正是由于双向链表的特性，使得我们添加的元素顺序是相对有序的，**也就是添加的顺序和打印出来的顺序是一样的。**

**关于扩容**

首先，`LinkedHashSet`如果使用无参数构造器初始化，那么它默认会开辟一个`16`大小的空间，负载因子依旧是`0.74`，首次扩容的阈值为`12`。这些数值是不是很眼熟？如果你看了前面`HashSet`的源码分析的话。

```java
public LinkedHashSet() {
    super(16, .75f, true);
}
```

虽然讲的是`LinkdeHashSet`，但本质上分析的还是`HashSet`，再本质就是`LinkedHashMap`，再继续套娃你会发现，**就是讲的`HashMap`，可见这家伙才是主角。**

****



未完待续……

